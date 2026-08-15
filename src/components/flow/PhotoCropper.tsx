'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PhotoCrop } from '@/lib/photo-url';
import type { PreparedPhoto } from '@/lib/photo';

/** Portrait, which is what a photo of two people standing together wants to be. */
export const CROP_ASPECT = 4 / 5;

type Transform = { zoom: number; tx: number; ty: number };

/**
 * Drag to position, pinch or slide to zoom, inside a fixed frame.
 *
 * The spec calls this mandatory and it is the single feature that most decides whether
 * a photo looks intentional. Customers upload whatever is in their camera roll: a wide
 * group shot, a portrait with the couple in one corner, a screenshot. Asking them to
 * crop it themselves before uploading does not work. Letting them drag it into a frame
 * does.
 *
 * It emits coordinates in the source image's own pixels rather than producing a new
 * file, so the crop stays non destructive: repositioning later, or switching to a theme
 * with a different frame, is a database update rather than another upload.
 */
export function PhotoCropper({
  photo,
  onChange,
}: {
  photo: PreparedPhoto;
  onChange: (crop: PhotoCrop) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState<Transform>({ zoom: 1, tx: 0, ty: 0 });

  const drag = useRef<{ pointerId: number; startX: number; startY: number; tx: number; ty: number } | null>(
    null,
  );

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const measure = () =>
      setFrame({ width: element.clientWidth, height: element.clientWidth / CROP_ASPECT });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /** Smallest scale at which the image still covers the frame. */
  const baseScale =
    frame.width > 0
      ? Math.max(frame.width / photo.width, frame.height / photo.height)
      : 1;

  const clamp = useCallback(
    (next: Transform): Transform => {
      const scale = baseScale * next.zoom;
      const scaledWidth = photo.width * scale;
      const scaledHeight = photo.height * scale;

      return {
        zoom: next.zoom,
        // The image may never expose an empty edge inside the frame.
        tx: Math.min(0, Math.max(frame.width - scaledWidth, next.tx)),
        ty: Math.min(0, Math.max(frame.height - scaledHeight, next.ty)),
      };
    },
    [baseScale, frame.height, frame.width, photo.height, photo.width],
  );

  // Report the crop in source pixels whenever the view changes.
  useEffect(() => {
    if (frame.width === 0) return;

    const scale = baseScale * transform.zoom;

    onChange({
      x: Math.max(0, -transform.tx / scale),
      y: Math.max(0, -transform.ty / scale),
      width: Math.min(photo.width, frame.width / scale),
      height: Math.min(photo.height, frame.height / scale),
    });
  }, [transform, baseScale, frame, photo.width, photo.height, onChange]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      tx: transform.tx,
      ty: transform.ty,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;

    setTransform((previous) =>
      clamp({
        zoom: previous.zoom,
        tx: current.tx + (event.clientX - current.startX),
        ty: current.ty + (event.clientY - current.startY),
      }),
    );
  }

  function handlePointerUp() {
    drag.current = null;
  }

  function handleZoom(zoom: number) {
    setTransform((previous) => {
      const scaleBefore = baseScale * previous.zoom;
      const scaleAfter = baseScale * zoom;

      // Zoom about the centre of the frame rather than the top corner, so the part
      // being looked at stays put.
      const centreX = (frame.width / 2 - previous.tx) / scaleBefore;
      const centreY = (frame.height / 2 - previous.ty) / scaleAfter;

      return clamp({
        zoom,
        tx: frame.width / 2 - centreX * scaleAfter,
        ty: frame.height / 2 - centreY * scaleAfter,
      });
    });
  }

  const scale = baseScale * transform.zoom;

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ height: frame.height || undefined }}
        className="relative w-full cursor-grab touch-none overflow-hidden rounded-2xl border border-line bg-cream-deep active:cursor-grabbing"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.previewUrl}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: photo.width * scale,
            height: photo.height * scale,
            transform: `translate(${transform.tx}px, ${transform.ty}px)`,
            maxWidth: 'none',
          }}
        />

        <div
          className="pointer-events-none absolute inset-0 border-2 border-white/60"
          aria-hidden="true"
        />
      </div>

      <label className="flex items-center gap-3">
        <span className="text-xs text-ink-faint">تكبير</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={transform.zoom}
          onChange={(event) => handleZoom(Number(event.target.value))}
          className="h-1 flex-1 accent-gold"
        />
      </label>
    </div>
  );
}
