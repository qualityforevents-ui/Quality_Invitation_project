'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertOperator } from '@/lib/admin-auth';
import { getBySlug, updateInvitation } from '@/lib/invitations';
import { getById } from '@/lib/admin-queries';
import { DEFAULT_EXPIRY_DAYS_AFTER_EVENT } from '@/lib/constants';
import { isValidSlug } from '@/lib/slug';
import { getPackage } from '@/lib/packages';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Rebuilds the cached pages an invitation appears on.
 *
 * The public page is statically generated and served from the edge, so a change to the
 * row means nothing until the cached HTML is thrown away. The customer's waiting screen
 * is refreshed too, so somebody sitting on it sees the flip without waiting for the
 * next poll.
 */
function revalidateInvitation(slug: string, editToken: string): void {
  revalidatePath(`/${slug}`);
  revalidatePath(`/build/status/${editToken}`);
}

export async function activateInvitation(formData: FormData): Promise<void> {
  await assertOperator();

  const id = String(formData.get('id') ?? '');
  const paymentNote = String(formData.get('paymentNote') ?? '').trim() || null;

  const invitation = await getById(id);
  if (!invitation) throw new Error('Invitation not found');

  /*
   * The expiry is the difference the customer paid for, so it is derived from the
   * package rather than applied uniformly.
   *
   * Basic still gets a month past the event rather than being cut off at midnight on
   * the day. Guests reopen these for a while afterwards to look at the photo, and
   * killing a link the morning after a wedding to enforce a price tier would be a
   * miserable thing to do to somebody. The paid tiers simply never expire.
   */
  const tier = getPackage(invitation.package);
  // No date means no expiry to compute from. The readiness check will not let an
  // invitation reach activation without one, so this is a guard rather than a case:
  // never expiring is the harmless way to be wrong about it.
  const expiresAt =
    tier.permanent || !invitation.eventDate
      ? null
      : new Date(invitation.eventDate.getTime() + DEFAULT_EXPIRY_DAYS_AFTER_EVENT * DAY_MS);

  const updated = await updateInvitation(id, {
      status: 'ACTIVE',
      activatedAt: invitation.activatedAt ?? new Date(),
      expiresAt,
      paymentNote,
      rejectReason: null,
    });

  revalidateInvitation(updated.slug, updated.editToken);
  revalidatePath('/admin');

  redirect(`/admin/invitation/${id}`);
}

export async function rejectInvitation(formData: FormData): Promise<void> {
  await assertOperator();

  const id = String(formData.get('id') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();

  const invitation = await getById(id);
  if (!invitation) throw new Error('Invitation not found');

  const updated = await updateInvitation(id, {
      status: 'REJECTED',
      // Stored rather than left blank, so the customer's waiting screen can say what
      // went wrong instead of silently never changing.
      rejectReason: reason || 'محتاجين نراجع التحويل تاني',
    });

  revalidateInvitation(updated.slug, updated.editToken);
  revalidatePath('/admin');

  redirect(`/admin/invitation/${id}`);
}

/**
 * Pushes the expiry out.
 *
 * Guests keep reopening these after the day, and occasionally somebody asks for their
 * link back. Cheaper than explaining why it stopped working.
 */
export async function extendExpiry(formData: FormData): Promise<void> {
  await assertOperator();

  const id = String(formData.get('id') ?? '');
  const days = Math.min(365, Math.max(1, Number(formData.get('days') ?? 30) || 30));

  const invitation = await getById(id);
  if (!invitation) throw new Error('Invitation not found');

  const from = invitation.expiresAt && invitation.expiresAt > new Date() ? invitation.expiresAt : new Date();

  const updated = await updateInvitation(id, {
      expiresAt: new Date(from.getTime() + days * DAY_MS),
      // An expired link being extended is being brought back, so it goes live again.
      status: invitation.status === 'EXPIRED' ? 'ACTIVE' : invitation.status,
    });

  revalidateInvitation(updated.slug, updated.editToken);
  redirect(`/admin/invitation/${id}`);
}

/**
 * Renames the public link.
 *
 * The transliteration that generates these is best effort and will sometimes spell a
 * name in a way its owner does not recognise. This is the fix for that, and the reason
 * the automatic version is allowed to be imperfect.
 *
 * Changing it after guests have the old link breaks the old one, so it is worth doing
 * before activation where possible.
 */
export async function changeSlug(formData: FormData): Promise<void> {
  await assertOperator();

  const id = String(formData.get('id') ?? '');
  const requested = String(formData.get('slug') ?? '')
    .trim()
    .toLowerCase();

  if (!isValidSlug(requested)) {
    redirect(`/admin/invitation/${id}?error=slug`);
  }

  const invitation = await getById(id);
  if (!invitation) throw new Error('Invitation not found');
  if (invitation.slug === requested) redirect(`/admin/invitation/${id}`);

  const taken = await getBySlug(requested);
  if (taken) redirect(`/admin/invitation/${id}?error=taken`);

  const previousSlug = invitation.slug;

  const updated = await updateInvitation(id, { slug: requested });

  // The page cached under the old slug is now wrong and has to go, or the old link
  // keeps serving a live invitation from a URL that no longer belongs to it.
  revalidatePath(`/${previousSlug}`);
  revalidateInvitation(updated.slug, updated.editToken);

  redirect(`/admin/invitation/${id}`);
}

export async function deactivateInvitation(formData: FormData): Promise<void> {
  await assertOperator();

  const id = String(formData.get('id') ?? '');

  const updated = await updateInvitation(id, { status: 'EXPIRED' });

  revalidateInvitation(updated.slug, updated.editToken);
  revalidatePath('/admin');

  redirect(`/admin/invitation/${id}`);
}
