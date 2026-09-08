'use client';

import { useRef, useState } from 'react';
import { PhotoCropper } from './PhotoCropper';
import { Button } from '@/components/ui/button';
import { preparePhoto, uploadToImageKit, type PreparedPhoto } from '@/lib/photo';
import { buildPhotoUrl, type PhotoCrop } from '@/lib/photo-url';
import type { Dictionary } from '@/i18n/ui';

type Stage = 'idle' | 'preparing' | 'cropping' | 'uploading';

const ERROR_KEYS: Record<string, keyof Dictionary['errors']> = {
  type: 'photoType',
  'too-large': 'photoTooLarge',
  'too-small': 'photoTooSmall',
  heic: 'photoHeic',
  decode: 'photoDecode',
  upload: 'photoUpload',
  auth: 'photoUpload',
};

/**
 * Optional, and framed so that a mediocre photo still looks intentional.
 *
 * Everything expensive happens on the device: decoding, orientation, stripping
 * metadata, scaling and compression all run before a single byte leaves the phone, and
 * the upload then goes straight to ImageKit rather than through a serverless function.
 */
export function PhotoUpload({
  t,
  initialPhotoPath,
  initialCrop,
  onSaved,
}: {
  t: Dictionary;
  initialPhotoPath: string | null;
  /**
   * The framing already chosen, so the thumbnail shows the photo as the card will
   * crop it rather than as it came off the phone.
   */
  initialCrop: PhotoCrop | null;
  onSaved: (value: { photoPath: string | null; crop: PhotoCrop | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [crop, setCrop] = useState<PhotoCrop | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(initialPhotoPath);
  const [savedCrop, setSavedCrop] = useState<PhotoCrop | null>(initialCrop);

  async function handleFile(file: File) {
    setError(null);
    setStage('preparing');

    try {
      const prepared = await preparePhoto(file);
      setPhoto(prepared);
      setStage('cropping');
    } catch (caught) {
      const key = ERROR_KEYS[(caught as Error).message] ?? 'generic';
      setError(t.errors[key] ?? t.errors.generic);
      setStage('idle');
    }
  }

  async function handleConfirm() {
    if (!photo) return;

    setStage('uploading');
    setError(null);

    try {
      const uploaded = await uploadToImageKit(photo);
      setSavedPath(uploaded.filePath);
      setSavedCrop(crop);
      onSaved({ photoPath: uploaded.filePath, crop });

      URL.revokeObjectURL(photo.previewUrl);
      setPhoto(null);
      setStage('idle');
    } catch (caught) {
      const key = ERROR_KEYS[(caught as Error).message] ?? 'photoUpload';
      setError(t.errors[key] ?? t.errors.generic);
      setStage('cropping');
    }
  }

  function handleRemove() {
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    setPhoto(null);
    setSavedPath(null);
    setSavedCrop(null);
    setCrop(null);
    setStage('idle');
    onSaved({ photoPath: null, crop: null });
  }

  const busy = stage === 'preparing' || stage === 'uploading';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-muted-foreground">{t.theme.photoGuidance}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so picking the same file twice still fires a change.
          event.target.value = '';
          if (file) void handleFile(file);
        }}
      />

      {photo ? (
        <>
          <PhotoCropper photo={photo} onChange={setCrop} />
          <p className="text-xs text-muted-foreground">{t.theme.photoDragHint}</p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleRemove}
              className="flex-1 rounded-full"
            >
              {t.common.back}
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleConfirm}
              disabled={busy}
              className="flex-[1.4] rounded-full"
            >
              {stage === 'uploading' ? t.theme.photoUploading : t.theme.photoUpload}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3">
          {/*
            The photo itself, once there is one.
            Without it the question said "change the photo" and showed nothing, so the
            only way to check which photo was on the card was to open the full preview.
            Cropped exactly as the card will crop it, because a thumbnail of the
            uncropped original would answer a question nobody asked.
          */}
          {savedPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={buildPhotoUrl(savedPath, savedCrop, { width: 160, height: 160 })}
              alt={t.flow.photoAdded}
              width={56}
              height={56}
              className="size-14 shrink-0 rounded-xl border border-border object-cover"
            />
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex-1 rounded-full"
          >
            {stage === 'preparing'
              ? t.theme.photoPreparing
              : savedPath
                ? t.theme.photoChange
                : t.theme.photoChoose}
          </Button>

          {savedPath ? (
            <Button
              type="button"
              variant="link"
              onClick={handleRemove}
              className="text-destructive"
            >
              {t.theme.photoRemove}
            </Button>
          ) : null}
        </div>
      )}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
