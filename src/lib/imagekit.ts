import { createHmac } from 'node:crypto';

export const IMAGEKIT_URL_ENDPOINT = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? '').replace(
  /\/+$/,
  '',
);
export const IMAGEKIT_PUBLIC_KEY = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? '';

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

export type PhotoCrop = { x: number; y: number; width: number; height: number };

export function parseCrop(value: unknown): PhotoCrop | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  const numbers = ['x', 'y', 'width', 'height'].map((key) => Number(candidate[key]));

  if (numbers.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (numbers[2] <= 0 || numbers[3] <= 0) return null;

  return { x: numbers[0], y: numbers[1], width: numbers[2], height: numbers[3] };
}

/**
 * Builds the delivery URL for a photo.
 *
 * The crop is applied here rather than baked into the stored file, which is the whole
 * reason the coordinates are kept in the database: repositioning a photo, or moving to
 * a theme with a different aspect ratio, becomes an update to four numbers instead of
 * asking the customer to upload again.
 *
 * f-auto lets ImageKit serve WebP or AVIF where the browser takes it, q-80 is the point
 * where a wedding photo stops getting visibly better, and the width is the layout width
 * rather than the original, which is what keeps delivery near 150KB.
 */
export function buildPhotoUrl(
  photoPath: string,
  crop: PhotoCrop | null,
  options: { width: number; height?: number } = { width: 800 },
): string {
  const transforms: string[] = [];

  if (crop) {
    transforms.push(
      `cm-extract,x-${Math.round(crop.x)},y-${Math.round(crop.y)},w-${Math.round(crop.width)},h-${Math.round(crop.height)}`,
    );
  }

  const resize = [`w-${Math.round(options.width)}`];
  if (options.height) resize.push(`h-${Math.round(options.height)}`, 'cm-pad_resize');
  resize.push('f-auto', 'q-80');

  transforms.push(resize.join(','));

  const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;

  // Chained transformations are joined with a colon and applied in order.
  return `${IMAGEKIT_URL_ENDPOINT}${path}?tr=${transforms.join(':')}`;
}
