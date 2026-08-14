import { randomBytes, randomInt } from 'node:crypto';

/**
 * The secret that stands in for a customer account. Anyone holding it can edit the
 * invitation, so it is generated from a CSPRNG and never derived from event data.
 * 24 bytes of entropy encode to 32 base64url characters.
 */
export function generateEditToken(): string {
  return randomBytes(24).toString('base64url');
}

/**
 * Deliberately excludes O, 0, I, 1, L. The operator reads these ids out of a
 * WhatsApp message and retypes them into a search box, and those five characters
 * are where transcription goes wrong.
 */
const REQUEST_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const REQUEST_ID_LENGTH = 6;

export function generateRequestId(): string {
  let out = '';
  for (let i = 0; i < REQUEST_ID_LENGTH; i += 1) {
    // randomInt is rejection sampled, so no modulo bias across the 31 character set.
    out += REQUEST_ID_ALPHABET[randomInt(REQUEST_ID_ALPHABET.length)];
  }
  return `QLT-${out}`;
}

/** Short suffix used to break slug collisions, e.g. "moaaz-reem-x7". */
const SUFFIX_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

export function generateSlugSuffix(length = 2): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += SUFFIX_ALPHABET[randomInt(SUFFIX_ALPHABET.length)];
  }
  return out;
}

/**
 * Retries an insert until the database stops reporting a unique collision.
 *
 * Checking whether an id is free and then inserting it is a race: two requests can
 * both read "free" and one of them then fails. So the insert is simply attempted, and
 * the attempt number is handed back so the caller can widen its candidates on later
 * tries, for example by lengthening the slug suffix.
 */
export async function withUniqueRetry<T>(
  attempt: (attemptIndex: number) => Promise<T>,
  maxAttempts = 8,
): Promise<T> {
  let lastError: unknown;

  for (let index = 0; index < maxAttempts; index += 1) {
    try {
      return await attempt(index);
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      lastError = error;
    }
  }

  throw new Error(
    `Could not find a free identifier after ${maxAttempts} attempts. Last error: ${String(lastError)}`,
  );
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}
