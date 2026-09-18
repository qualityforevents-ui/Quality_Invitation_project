import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies that a webhook really came from Notion.
 *
 * In its own module rather than inline in the route, because it is the only thing
 * standing between a public URL and an integration token that can rewrite every
 * booking, and a thing like that should be testable without standing up a server.
 *
 * Notion signs the raw request body with the subscription's verification token and
 * sends the result as `X-Notion-Signature`, prefixed `sha256=`.
 */
export function verifyNotionSignature({
  rawBody,
  signature,
  secret,
}: {
  /**
   * The exact bytes Notion sent, as text.
   *
   * Not a re-serialised object. `JSON.stringify` of a parsed body differs from the
   * original often enough — key order, unicode escaping, whitespace — that this is the
   * classic reason a webhook signature never verifies and somebody eventually gives up
   * and removes the check.
   */
  rawBody: string;
  signature: string | null;
  secret: string;
}): boolean {
  if (!signature || !secret) return false;

  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);

  /*
   * Length checked first, then a constant time comparison.
   *
   * timingSafeEqual throws on a length mismatch rather than returning false, and a
   * plain === would leak the correct signature one byte at a time to anybody willing to
   * measure how long the response takes.
   */
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Builds a signature the way Notion does. Used by the tests, and by nothing else. */
export function signNotionBody(rawBody: string, secret: string): string {
  return `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;
}
