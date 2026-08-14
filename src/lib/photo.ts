'use client';

/** Below this a photo looks soft once it fills a phone screen. */
export const MIN_DIMENSION = 1000;
/** Before compression. Modern phone cameras clear this easily. */
export const MAX_BYTES = 10 * 1024 * 1024;
/** Target after compression, so 3GB of ImageKit storage holds thousands of these. */
export const TARGET_BYTES = 500 * 1024;
/** Long edge after downscaling. Larger than any layout needs, so crops stay sharp. */
export const MAX_EDGE = 2000;

export type PhotoError =
  | 'type'
  | 'too-large'
  | 'too-small'
  | 'decode'
  | 'heic'
  | 'upload'
  | 'auth';

export type PreparedPhoto = {
  blob: Blob;
  width: number;
  height: number;
  previewUrl: string;
};

const ACCEPTED = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

function looksHeic(file: File): boolean {
  // Some iOS versions hand over an empty type, so the extension is checked too.
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.hei[cf]$/i.test(file.name)
  );
}

export function checkFileType(file: File): boolean {
  return ACCEPTED.includes(file.type) || looksHeic(file) || file.type.startsWith('image/');
}

/**
 * Turns whatever the customer picked into a plain JPEG the rest of the flow can handle.
 *
 * Three things happen here and each one matters.
 *
 * HEIC is decoded first. It is the iPhone default and no browser except Safari can draw
 * it, so without this step a large share of customers hit an immediate failure on a
 * photo that looks fine to them. The decoder is close to a megabyte, so it is imported
 * only when a HEIC actually arrives.
 *
 * EXIF is removed, not by stripping tags but as a consequence of redrawing the image
 * onto a canvas and re encoding: the output carries no metadata at all. Phone photos
 * carry GPS coordinates, and these links get forwarded to hundreds of people. The
 * orientation tag is read before that happens, through createImageBitmap with
 * imageOrientation from-image, because re encoding discards the tag and a photo that
 * was upright would otherwise come out on its side.
 *
 * Then it is scaled and compressed towards roughly half a megabyte.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  if (file.size > MAX_BYTES) throw new Error('too-large' satisfies PhotoError);
  if (!checkFileType(file)) throw new Error('type' satisfies PhotoError);

  let source: Blob = file;

  if (looksHeic(file)) {
    try {
      const { default: heic2any } = await import('heic2any');
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
      source = Array.isArray(converted) ? converted[0] : converted;
    } catch {
      throw new Error('heic' satisfies PhotoError);
    }
  }

  let bitmap: ImageBitmap;
  try {
    // from-image applies the EXIF rotation now, while the tag still exists.
    bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('decode' satisfies PhotoError);
  }

  if (bitmap.width < MIN_DIMENSION || bitmap.height < MIN_DIMENSION) {
    bitmap.close();
    throw new Error('too-small' satisfies PhotoError);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('decode' satisfies PhotoError);
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Step the quality down until it fits, rather than guessing one value that is either
  // wasteful on a simple photo or mushy on a busy one.
  let blob: Blob | null = null;
  for (const quality of [0.86, 0.78, 0.7, 0.62, 0.54]) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (blob && blob.size <= TARGET_BYTES) break;
  }

  if (!blob) throw new Error('decode' satisfies PhotoError);

  return { blob, width, height, previewUrl: URL.createObjectURL(blob) };
}

export type UploadResult = { filePath: string; fileId: string; width: number; height: number };

/** Uploads the prepared JPEG straight to ImageKit using a signature from our server. */
export async function uploadToImageKit(photo: PreparedPhoto): Promise<UploadResult> {
  const authResponse = await fetch('/api/imagekit/auth', { cache: 'no-store' });
  if (!authResponse.ok) throw new Error('auth' satisfies PhotoError);

  const auth = (await authResponse.json()) as {
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
    fileName: string;
    folder: string;
  };

  const form = new FormData();
  form.append('file', photo.blob, auth.fileName);
  form.append('fileName', auth.fileName);
  form.append('folder', auth.folder);
  form.append('publicKey', auth.publicKey);
  form.append('signature', auth.signature);
  form.append('expire', String(auth.expire));
  form.append('token', auth.token);
  // A re upload replaces the previous photo instead of accumulating orphans.
  form.append('useUniqueFileName', 'false');
  form.append('overwriteFile', 'true');

  const upload = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: form,
  });

  if (!upload.ok) throw new Error('upload' satisfies PhotoError);

  const result = (await upload.json()) as {
    filePath: string;
    fileId: string;
    width?: number;
    height?: number;
  };

  return {
    filePath: result.filePath,
    fileId: result.fileId,
    width: result.width ?? photo.width,
    height: result.height ?? photo.height,
  };
}
