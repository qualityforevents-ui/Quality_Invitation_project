import { createHmac } from 'node:crypto';
import { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT } from './photo-url';

/**
 * The server half of the ImageKit integration. This module signs uploads, so it reaches
 * for node:crypto on its first line and must never be imported from a client component.
 *
 * Everything a browser legitimately needs, the delivery URL builder, the crop parser and
 * the two public values, lives in `./photo-url` and is re-exported here so the server
 * callers that already import from this path keep working.
 */
export { IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY, parseCrop, buildPhotoUrl } from './photo-url';
export type { PhotoCrop } from './photo-url';

export function isImageKitConfigured(): boolean {
  return (
    IMAGEKIT_URL_ENDPOINT.length > 0 &&
    IMAGEKIT_PUBLIC_KEY.length > 0 &&
    (process.env.IMAGEKIT_PRIVATE_KEY ?? '').length > 0
  );
}

/**
 * Signs a browser upload.
 *
 * The private key never leaves the server. The browser asks for a short lived token,
 * signature and expiry, then uploads straight to ImageKit, which keeps a four megabyte
 * photo from making a round trip through a serverless function that has a body size
 * limit anyway.
 */
export function createUploadAuth(): { token: string; expire: number; signature: string } {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? '';

  // Deliberately short. It only has to survive one upload that is starting right now.
  const expire = Math.floor(Date.now() / 1000) + 5 * 60;
  const token = crypto.randomUUID();

  const signature = createHmac('sha1', privateKey).update(token + expire).digest('hex');

  return { token, expire, signature };
}
