import { db, defined, invitations, toDate, toDateOr } from './db';
import { buildSlugBase } from './slug';
import { generateEditToken, generateRequestId, generateSlugSuffix } from './tokens';
import { DEFAULT_THEME_ID } from './constants';
import { DEFAULT_PACKAGE } from './packages';
import { DEFAULT_VERSE_ID } from './verses';
import { NO_MUSIC_TRACK_ID } from './music';
import { fromDateInputValue } from './format';
import { parseCrop } from './photo-url';
import { getTheme } from '@/themes/registry';
import type { DocumentData, DocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import type { InvitationPatch } from './validation';
import type { Invitation, Lang } from './types';

/** Statuses whose content the customer is still allowed to change. */
const EDITABLE_STATUSES = new Set(['DRAFT', 'AWAITING_CONFIRMATION', 'ACTIVE']);

export function isEditable(invitation: Invitation): boolean {
  return EDITABLE_STATUSES.has(invitation.status);
}

/**
 * A stored document, read back as the shape the rest of the app expects.
 *
 * Every field is defaulted rather than trusted. Postgres refused a row that did not
 * match the schema; Firestore accepts whatever it is handed, so a document written by
 * an older version of this code is a normal thing to read and not an error. `verseId`
 * is the live example: documents written before the verse question existed do not
 * carry it, and the default here is what the migration's DEFAULT clause used to do.
 */
export function mapInvitation(doc: DocumentSnapshot<DocumentData>): Invitation {
  const data = doc.data() ?? {};
  const epoch = new Date(0);

  return {
    id: doc.id,
    editToken: String(data.editToken ?? ''),
    slug: String(data.slug ?? ''),
    requestId: String(data.requestId ?? ''),
    status: data.status ?? 'DRAFT',

    package: data.package ?? DEFAULT_PACKAGE,
    customRequest: data.customRequest ?? null,

    uiLang: data.uiLang ?? 'AR',
    invitationLang: data.invitationLang ?? 'AR',

    eventType: data.eventType ?? 'ENGAGEMENT',
    name1: String(data.name1 ?? ''),
    name2: String(data.name2 ?? ''),
    eventDate: toDate(data.eventDate),
    eventTime: String(data.eventTime ?? ''),
    venueName: String(data.venueName ?? ''),
    venueMapUrl: data.venueMapUrl ?? null,
    customMessage: data.customMessage ?? null,

    verseId: data.verseId ?? DEFAULT_VERSE_ID,

    themeId: data.themeId ?? DEFAULT_THEME_ID,
    musicTrackId: String(data.musicTrackId ?? ''),
    photoFileId: data.photoFileId ?? null,
    photoCrop: parseCrop(data.photoCrop),
    ogImageUrl: data.ogImageUrl ?? null,

    customerPhone: data.customerPhone ?? null,
    paymentNote: data.paymentNote ?? null,
    rejectReason: data.rejectReason ?? null,
    viewCount: Number(data.viewCount ?? 0),
    activatedAt: toDate(data.activatedAt),
    expiresAt: toDate(data.expiresAt),
    createdAt: toDateOr(data.createdAt, epoch),
    updatedAt: toDateOr(data.updatedAt, epoch),
  };
}

/** The one-document result of a lookup on a field that is unique by construction. */
async function findOneBy(field: string, value: string): Promise<Invitation | null> {
  if (!value) return null;
  const snapshot = await invitations().where(field, '==', value).limit(1).get();
  return snapshot.empty ? null : mapInvitation(snapshot.docs[0]);
}

/**
 * The slug a draft should have, given the names typed so far.
 *
 * Before both names exist there is nothing worth deriving, so a throwaway value keeps
 * the field populated. Nothing points at a draft's slug, so churn here is free.
 */
function desiredSlug(name1: string, name2: string, attemptIndex: number): string {
  const hasBothNames = name1.trim().length > 0 && name2.trim().length > 0;

  if (!hasBothNames) return `d-${generateSlugSuffix(6)}`;

  const base = buildSlugBase(name1, name2);
  if (attemptIndex === 0) return base;

  // Widen the suffix as attempts fail, so a popular pair of names still resolves.
  return `${base}-${generateSlugSuffix(attemptIndex === 1 ? 2 : 4)}`;
}

/**
 * Claims a slug nobody else holds, inside a transaction.
 *
 * Postgres enforced this with a unique index and the old code simply attempted the
 * insert and retried on the constraint violation. Firestore has no unique constraints,
 * so checking and then writing would be a race, and losing that race means two
 * invitations answering to one URL — a guest opening the wrong couple's wedding. The
 * transaction closes it: the read and the write commit together or not at all.
 *
 * This is the one place the move gives something back that has to be paid for by hand.
 */
async function claimSlug(
  tx: Transaction,
  name1: string,
  name2: string,
  excludeId: string | null,
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = desiredSlug(name1, name2, attempt);
    const held = await tx.get(invitations().where('slug', '==', candidate).limit(1));

    if (held.empty || held.docs[0].id === excludeId) return candidate;
  }

  throw new Error('Could not find a free slug after 8 attempts.');
}

export async function getByEditToken(editToken: string): Promise<Invitation | null> {
  return findOneBy('editToken', editToken);
}

export async function getBySlug(slug: string): Promise<Invitation | null> {
  return findOneBy('slug', slug);
}

export async function getByRequestId(requestId: string): Promise<Invitation | null> {
  if (!requestId) return null;
  return findOneBy('requestId', requestId.toUpperCase().trim());
}

/**
 * Creates the DRAFT document on the customer's first keystroke.
 *
 * Almost everything is optional at this point, so the document is built from defaults
 * and then filled in by successive autosaves.
 */
export async function createDraft(patch: InvitationPatch, uiLang: Lang): Promise<Invitation> {
  const name1 = patch.name1 ?? '';
  const name2 = patch.name2 ?? '';

  const theme = getTheme(patch.themeId ?? DEFAULT_THEME_ID);
  const eventDate = patch.eventDate ? fromDateInputValue(patch.eventDate) : null;
  const now = new Date();

  const ref = invitations().doc();

  await db().runTransaction(async (tx) => {
    const slug = await claimSlug(tx, name1, name2, null);

    tx.set(ref, {
      editToken: generateEditToken(),
      requestId: generateRequestId(),
      slug,
      status: 'DRAFT',

      uiLang: patch.uiLang ?? uiLang,
      // Deliberately not seeded from uiLang. Which language somebody reads the builder
      // in says nothing about which language their guests should read the card in, and
      // inheriting it quietly made the choice for them. Arabic is the default because
      // it is the primary market, and the real decision is made on the design step
      // where the toggle redraws every miniature.
      invitationLang: patch.invitationLang ?? 'AR',

      eventType: patch.eventType ?? 'ENGAGEMENT',
      name1,
      name2,
      // Null and empty, not a guess. Nothing here has been asked yet, and a default
      // written now is a default the customer is later shown as their own answer.
      eventDate: eventDate ?? null,
      eventTime: patch.eventTime ?? '',
      venueName: patch.venueName ?? '',
      venueMapUrl: patch.venueMapUrl ?? null,
      customMessage: patch.customMessage ?? null,

      verseId: patch.verseId ?? DEFAULT_VERSE_ID,

      package: patch.package ?? DEFAULT_PACKAGE,
      customRequest: patch.customRequest ?? null,

      themeId: theme.id,
      // Silence, not a guess. Music is the customer's choice and nothing else's: a
      // track written in here on their behalf is a track they are later shown as their
      // own answer, and most people never touch an answer that is already filled in.
      musicTrackId: patch.musicTrackId ?? NO_MUSIC_TRACK_ID,
      photoFileId: null,
      photoCrop: null,
      ogImageUrl: null,

      customerPhone: patch.customerPhone ?? null,
      paymentNote: null,
      rejectReason: null,
      viewCount: 0,
      activatedAt: null,
      expiresAt: null,
      createdAt: now,
      updatedAt: now,
    });
  });

  return mapInvitation(await ref.get());
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
export async function applyPatch(
  invitation: Invitation,
  patch: InvitationPatch,
): Promise<Invitation> {
  const eventDate = patch.eventDate ? fromDateInputValue(patch.eventDate) : undefined;

  // Undefined means "do not touch this field". defined() strips those keys before
  // the write, because Firestore rejects an undefined value rather than ignoring it.
  const data: Record<string, unknown> = defined({
    uiLang: patch.uiLang,
    invitationLang: patch.invitationLang,
    eventType: patch.eventType,
    name1: patch.name1,
    name2: patch.name2,
    eventDate,
    eventTime: patch.eventTime,
    venueName: patch.venueName,
    venueMapUrl: patch.venueMapUrl,
    customMessage: patch.customMessage,
    verseId: patch.verseId,
    package: patch.package,
    customRequest: patch.customRequest,
    themeId: patch.themeId !== undefined ? getTheme(patch.themeId).id : undefined,
    musicTrackId: patch.musicTrackId,
    photoFileId: patch.photoFileId,
    photoCrop: patch.photoCrop,
    customerPhone: patch.customerPhone,
    // Prisma kept this current with @updatedAt. Nothing does that here, and the admin's
    // stale-request alert is measured from it, so it is set on every write by hand.
    updatedAt: new Date(),
  });

  const ref = invitations().doc(invitation.id);

  const nextName1 = patch.name1 ?? invitation.name1;
  const nextName2 = patch.name2 ?? invitation.name2;
  const namesChanged = nextName1 !== invitation.name1 || nextName2 !== invitation.name2;
  const shouldReslug = invitation.status === 'DRAFT' && namesChanged;

  if (!shouldReslug) {
    await ref.update(data);
    return mapInvitation(await ref.get());
  }

  await db().runTransaction(async (tx) => {
    const slug = await claimSlug(tx, nextName1, nextName2, invitation.id);
    tx.update(ref, { ...data, slug });
  });

  return mapInvitation(await ref.get());
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

  const ref = invitations().doc(invitation.id);
  await ref.update({ status: 'AWAITING_CONFIRMATION', updatedAt: new Date() });

  return mapInvitation(await ref.get());
}

/**
 * Writes fields to one invitation and hands back the whole thing.
 *
 * Every admin action needs the slug and editToken afterwards to revalidate the cached
 * pages, which Prisma's update returned for free. Firestore's does not return the
 * document, so the read-back lives here rather than at five call sites.
 */
export async function updateInvitation(
  id: string,
  data: Record<string, unknown>,
): Promise<Invitation> {
  const ref = invitations().doc(id);
  await ref.update(defined({ ...data, updatedAt: new Date() }));
  return mapInvitation(await ref.get());
}
