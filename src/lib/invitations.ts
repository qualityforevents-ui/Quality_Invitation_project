import { Prisma } from '@/generated/prisma/client';
import { prisma } from './db';
import { buildSlugBase } from './slug';
import { generateEditToken, generateRequestId, generateSlugSuffix, withUniqueRetry } from './tokens';
import { DEFAULT_THEME_ID } from './constants';
import { DEFAULT_PACKAGE } from './packages';
import { fromDateInputValue } from './format';
import { getTheme } from '@/themes/registry';
import type { InvitationPatch } from './validation';
import type { Invitation } from '@/generated/prisma/client';
import type { Lang } from '@/generated/prisma/enums';

/** Statuses whose content the customer is still allowed to change. */
const EDITABLE_STATUSES = new Set(['DRAFT', 'AWAITING_CONFIRMATION', 'ACTIVE']);

export function isEditable(invitation: Invitation): boolean {
  return EDITABLE_STATUSES.has(invitation.status);
}

function defaultEventDate(): Date {
  // Far enough out that the date picker does not open on something already invalid.
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 60));
}

/**
 * The slug a draft should have, given the names typed so far.
 *
 * Before both names exist there is nothing worth deriving, so a throwaway value keeps
 * the unique column satisfied. Nothing points at a draft's slug, so churn here is free.
 */
function desiredSlug(name1: string, name2: string, attemptIndex: number): string {
  const hasBothNames = name1.trim().length > 0 && name2.trim().length > 0;

  if (!hasBothNames) return `d-${generateSlugSuffix(6)}`;

  const base = buildSlugBase(name1, name2);
  if (attemptIndex === 0) return base;

  // Widen the suffix as attempts fail, so a popular pair of names still resolves.
  return `${base}-${generateSlugSuffix(attemptIndex === 1 ? 2 : 4)}`;
}

export async function getByEditToken(editToken: string): Promise<Invitation | null> {
  if (!editToken) return null;
  return prisma.invitation.findUnique({ where: { editToken } });
}

export async function getBySlug(slug: string): Promise<Invitation | null> {
  if (!slug) return null;
  return prisma.invitation.findUnique({ where: { slug } });
}

export async function getByRequestId(requestId: string): Promise<Invitation | null> {
  if (!requestId) return null;
  return prisma.invitation.findUnique({ where: { requestId: requestId.toUpperCase().trim() } });
}

/**
 * Creates the DRAFT row on the customer's first keystroke.
 *
 * Almost everything is optional at this point, so the row is built from defaults and
 * then filled in by successive autosaves.
 */
export async function createDraft(patch: InvitationPatch, uiLang: Lang): Promise<Invitation> {
  const name1 = patch.name1 ?? '';
  const name2 = patch.name2 ?? '';

  const themeId = patch.themeId ?? DEFAULT_THEME_ID;
  const theme = getTheme(themeId);

  const eventDate = patch.eventDate ? fromDateInputValue(patch.eventDate) : null;

  return withUniqueRetry((attemptIndex) =>
    prisma.invitation.create({
      data: {
        editToken: generateEditToken(),
        requestId: generateRequestId(),
        slug: desiredSlug(name1, name2, attemptIndex),

        uiLang: patch.uiLang ?? uiLang,
        // Deliberately not seeded from uiLang. Which language somebody reads the
        // builder in says nothing about which language their guests should read the
        // card in, and inheriting it quietly made the choice for them. Arabic is the
        // default because it is the primary market, and the real decision is made on
        // the theme step where the toggle redraws every miniature.
        invitationLang: patch.invitationLang ?? 'AR',

        eventType: patch.eventType ?? 'ENGAGEMENT',
        name1,
        name2,
        eventDate: eventDate ?? defaultEventDate(),
        eventTime: patch.eventTime ?? '20:00',
        venueName: patch.venueName ?? '',
        venueMapUrl: patch.venueMapUrl ?? null,
        customMessage: patch.customMessage ?? null,

        package: patch.package ?? DEFAULT_PACKAGE,
        customRequest: patch.customRequest ?? null,

        themeId: theme.id,
        musicTrackId: patch.musicTrackId ?? theme.defaultMusicTrackId,

        customerPhone: patch.customerPhone ?? null,
      },
    }),
  );
}

/**
 * Applies an autosave patch.
 *
 * While the invitation is still a draft the slug is kept in step with the names, so a
 * customer who corrects a spelling gets a link that matches. Once the invitation has
 * moved past DRAFT the slug freezes: by then it has been shown on the waiting screen
 * and may already be in somebody's WhatsApp thread, and a link that changes underneath
 * a guest is worse than a link with a typo. The operator can still change it by hand.
 */
export async function applyPatch(invitation: Invitation, patch: InvitationPatch): Promise<Invitation> {
  const eventDate = patch.eventDate ? fromDateInputValue(patch.eventDate) : undefined;

  const data: Parameters<typeof prisma.invitation.update>[0]['data'] = {
    ...(patch.uiLang !== undefined ? { uiLang: patch.uiLang } : {}),
    ...(patch.invitationLang !== undefined ? { invitationLang: patch.invitationLang } : {}),
    ...(patch.eventType !== undefined ? { eventType: patch.eventType } : {}),
    ...(patch.name1 !== undefined ? { name1: patch.name1 } : {}),
    ...(patch.name2 !== undefined ? { name2: patch.name2 } : {}),
    ...(eventDate ? { eventDate } : {}),
    ...(patch.eventTime !== undefined ? { eventTime: patch.eventTime } : {}),
    ...(patch.venueName !== undefined ? { venueName: patch.venueName } : {}),
    ...(patch.venueMapUrl !== undefined ? { venueMapUrl: patch.venueMapUrl } : {}),
    ...(patch.customMessage !== undefined ? { customMessage: patch.customMessage } : {}),
    ...(patch.package !== undefined ? { package: patch.package } : {}),
    ...(patch.customRequest !== undefined ? { customRequest: patch.customRequest } : {}),
    ...(patch.themeId !== undefined ? { themeId: getTheme(patch.themeId).id } : {}),
    ...(patch.musicTrackId !== undefined ? { musicTrackId: patch.musicTrackId } : {}),
    ...(patch.photoFileId !== undefined ? { photoFileId: patch.photoFileId } : {}),
    ...(patch.photoCrop !== undefined ? { photoCrop: patch.photoCrop ?? Prisma.DbNull } : {}),
    ...(patch.customerPhone !== undefined ? { customerPhone: patch.customerPhone } : {}),
  };

  const nextName1 = patch.name1 ?? invitation.name1;
  const nextName2 = patch.name2 ?? invitation.name2;
  const namesChanged = nextName1 !== invitation.name1 || nextName2 !== invitation.name2;
  const shouldReslug = invitation.status === 'DRAFT' && namesChanged;

  if (!shouldReslug) {
    return prisma.invitation.update({ where: { id: invitation.id }, data });
  }

  return withUniqueRetry((attemptIndex) =>
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { ...data, slug: desiredSlug(nextName1, nextName2, attemptIndex) },
    }),
  );
}

/**
 * Moves a draft to AWAITING_CONFIRMATION.
 *
 * Called the moment the customer taps through to WhatsApp, before the link opens, so
 * the request is on the operator's pending list even if the customer never actually
 * sends the message. Those abandoned rows are the recoverable money the admin's stale
 * alert is there to surface.
 */
export async function markAwaitingConfirmation(invitation: Invitation): Promise<Invitation> {
  if (invitation.status !== 'DRAFT' && invitation.status !== 'REJECTED') return invitation;

  return prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: 'AWAITING_CONFIRMATION' },
  });
}
