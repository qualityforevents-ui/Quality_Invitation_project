import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { applyPatch, createDraft, getByEditToken, isEditable } from '@/lib/invitations';
import { getEditToken, getUiLang, setEditToken } from '@/lib/session';
import { invitationPatchSchema, isReadyForPreview, type InvitationPatch } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Fields that represent something the customer actually typed about their event.
 *
 * Only free text counts. Every other field on the form arrives with a default already
 * chosen, so eventType, eventDate, eventTime, themeId and musicTrackId are present and
 * non empty in the very first patch, and treating any of them as content would mean a
 * visitor who did nothing but tap the language toggle leaves a row behind. The admin's
 * drafts list exists to surface people who nearly bought something, and it is worth
 * nothing if it fills with blanks.
 *
 * The names sit at the top of the form, so a real customer creates their draft within
 * a second or two of starting regardless.
 */
const CONTENT_FIELDS: Array<keyof InvitationPatch> = [
  'name1',
  'name2',
  'venueName',
  'venueMapUrl',
  'customMessage',
  'customerPhone',
];

function hasContent(patch: InvitationPatch): boolean {
  return CONTENT_FIELDS.some((field) => {
    const value = patch[field];
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  });
}

/**
 * Autosave. Called debounced on every change in the builder.
 *
 * Authorisation is the editToken cookie and nothing else. The token is never accepted
 * from the request body, because that would turn knowing a token into a way to write
 * to somebody else's invitation from any origin.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed body' }, { status: 400 });
  }

  const parsed = invitationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid fields',
        fields: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const patch = parsed.data;
  const token = await getEditToken();
  const existing = token ? await getByEditToken(token) : null;

  try {
    if (!existing) {
      if (!hasContent(patch)) {
        return NextResponse.json({ ok: true, created: false });
      }

      const created = await createDraft(patch, await getUiLang());
      await setEditToken(created.editToken);

      return NextResponse.json({
        ok: true,
        created: true,
        requestId: created.requestId,
        slug: created.slug,
        status: created.status,
        ready: isReadyForPreview(created),
      });
    }

    if (!isEditable(existing)) {
      return NextResponse.json(
        { ok: false, error: 'This invitation can no longer be edited' },
        { status: 409 },
      );
    }

    const updated = await applyPatch(existing, patch);

    // A live invitation is served from a cached copy that knows nothing about this
    // write. Without throwing that copy away, a customer correcting a venue on the
    // morning of the event would see the change in the builder and nowhere else.
    if (updated.status === 'ACTIVE') {
      revalidatePath(`/${updated.slug}`);
    }

    return NextResponse.json({
      ok: true,
      created: false,
      requestId: updated.requestId,
      slug: updated.slug,
      status: updated.status,
      ready: isReadyForPreview(updated),
    });
  } catch (error) {
    console.error('[api/invitation] save failed', error);
    return NextResponse.json({ ok: false, error: 'Could not save' }, { status: 500 });
  }
}
