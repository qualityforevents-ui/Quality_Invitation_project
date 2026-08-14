'use client';

import { useRef, useState } from 'react';
import { PhotoCropper } from './PhotoCropper';
import { buttonClass } from '@/components/ui/Button';
import { preparePhoto, uploadToImageKit, type PreparedPhoto } from '@/lib/photo';
import type { PhotoCrop } from '@/lib/imagekit';
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
  onSaved,
}: {
  t: Dictionary;
  initialPhotoPath: string | null;
  onSaved: (value: { photoPath: string | null; crop: PhotoCrop | null }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [crop, setCrop] = useState<PhotoCrop | null>(null);
  const [savedPath, setSavedPath] = useState<string | null>(initialPhotoPath);

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
    setCrop(null);
    setStage('idle');
    onSaved({ photoPath: null, crop: null });
  }

  const busy = stage === 'preparing' || stage === 'uploading';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs leading-relaxed text-ink-faint">{t.theme.photoGuidance}</p>

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
          <p className="text-xs text-ink-faint">{t.theme.photoDragHint}</p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRemove}
              className={buttonClass('secondary', 'flex-1')}
            >
              {t.common.back}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className={buttonClass('primary', 'flex-[1.4]')}
            >
              {stage === 'uploading' ? t.theme.photoUploading : t.theme.photoUpload}
            </button>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={buttonClass('secondary', 'flex-1')}
          >
            {stage === 'preparing'
              ? t.theme.photoPreparing
              : savedPath
                ? t.theme.photoChange
                : t.theme.photoChoose}
          </button>

          {savedPath ? (
            <button
              type="button"
              onClick={handleRemove}
              className="tap-target rounded-full px-4 text-sm text-danger underline underline-offset-4"
            >
              {t.theme.photoRemove}
            </button>
          ) : null}
        </div>
      )}

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
