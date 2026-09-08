import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore } from 'firebase-admin/firestore';

/**
 * Firestore, reached over HTTPS with nothing to pool.
 *
 * This file used to hold a Postgres connection pool capped at one socket per
 * serverless invocation, a transaction pooler URL on one port and a direct URL on
 * another, and a routine that stripped `pgbouncer` and `connection_limit` out of the
 * connection string because the pg driver forwarded anything it did not recognise to
 * Postgres as a startup parameter and the connection failed outright.
 *
 * All of that was the cost of putting a relational database behind functions that
 * come and go. The app never used a join, a transaction or a group by, so it was
 * paying that cost for lookups by id and three filtered lists. Firestore is an HTTP
 * API: there is no connection to open, nothing to exhaust, and no second URL.
 */

const COLLECTIONS = {
  invitations: 'invitations',
  reviews: 'reviews',
} as const;

function missing(name: string): never {
  throw new Error(
    `${name} is not set. Copy .env.example to .env and fill in the Firebase service account. See SETUP.md.`,
  );
}

/**
 * Credentials come in as three variables rather than one blob of JSON.
 *
 * A whole service account JSON pasted into a dashboard field is one newline away from
 * being unreadable, and the failure is opaque. The private key still carries literal
 * `\n` sequences when it travels through an environment variable, which is what the
 * replace below is for.
 */
function credentials() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? missing('FIREBASE_PROJECT_ID');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? missing('FIREBASE_CLIENT_EMAIL');
  const privateKey = process.env.FIREBASE_PRIVATE_KEY ?? missing('FIREBASE_PRIVATE_KEY');

  return { projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') };
}

/**
 * One app per process, reused across invocations.
 *
 * `getApps()` is the Admin SDK's own guard against initialising the app twice, which
 * is what Next's hot reload would otherwise cause on every edit.
 */
export function firebaseApp(): App {
  if (getApps().length) return getApp();

  /*
   * The emulator needs no credentials, and asking for them would make the local
   * database impossible to run without handing a real service account key to every
   * machine that wants to work on the app. FIRESTORE_EMULATOR_HOST is the Admin SDK's
   * own switch: when it is set the SDK talks to localhost and never authenticates.
   */
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    return initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-qlty' });
  }

  return initializeApp({ credential: cert(credentials()) });
}

/**
 * No `settings()` call, deliberately.
 *
 * The obvious way to write the patch code below is to let undefined mean "leave this
 * field alone" and switch on `ignoreUndefinedProperties`. That setting can only be
 * applied once per Firestore instance and only before the instance is used, and Next's
 * dev server re-evaluates this module far more often than the Admin SDK resets its own
 * state. The result was every autosave returning a 500 until the server restarted, and
 * neither a module variable nor a globalThis stash fixed it reliably — the SDK's
 * lifetime and the module's are simply not the same lifetime.
 *
 * So nothing here depends on SDK global state. `defined()` below strips the undefined
 * keys explicitly, at the two places that build a patch, and `getFirestore` is left at
 * its defaults.
 */
export function db(): Firestore {
  return getFirestore(firebaseApp());
}

/**
 * Drops the keys whose value is undefined.
 *
 * Undefined means "the patch did not mention this field" throughout the write path,
 * and Firestore rejects an undefined value rather than ignoring it. Null is left
 * alone: a patch that explicitly clears the venue map link sends null and means it.
 */
export function defined(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

export function invitations() {
  return db().collection(COLLECTIONS.invitations);
}

export function reviews() {
  return db().collection(COLLECTIONS.reviews);
}

/* ------------------------------------------------------------------ mapping */

/**
 * Firestore hands back Timestamps where the rest of the app expects Dates.
 *
 * Everything above the data layer was written against Prisma, which returned real
 * Dates, and `invitation.updatedAt.getTime()` is called in the admin. Converting here
 * rather than at each reader is what keeps that code untouched by this move.
 */
export function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/** The same, for the fields that are never null. */
export function toDateOr(value: unknown, fallback: Date): Date {
  return toDate(value) ?? fallback;
}

export { Timestamp, FieldValue } from 'firebase-admin/firestore';
