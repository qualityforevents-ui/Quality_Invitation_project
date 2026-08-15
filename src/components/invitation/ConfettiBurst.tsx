'use client';

import { useEffect, useRef } from 'react';
import type { ConfettiRecipe, ConfettiShape } from '@/themes/registry';

/**
 * Paper thrown across the screen when the invitation opens.
 *
 * Hand rolled on a canvas rather than a confetti library, for two reasons that matter
 * here. The pieces are the theme's own palette and shapes, defined in the registry
 * beside its colours and fonts, so the burst belongs to the card instead of sitting on
 * top of it. And the physics are tuned for paper rather than particles: strips tumble
 * end over end by oscillating their drawn height, petals flutter, everything decelerates
 * hard and then drifts, which is what thrown paper actually does.
 *
 * One canvas, one animation loop, no shadows or blurs, and the loop cancels itself the
 * moment the last piece leaves the screen. Guests open these on mid range phones at
 * family gatherings, and a celebration that makes the card stutter is worse than none.
 *
 * Respects prefers-reduced-motion by not firing at all. MotionConfig only governs
 * framer, so the canvas checks on its own.
 */

/** Gentle, so pieces hang and flutter rather than plummet. */
const GRAVITY = 720;
/** Falling speed cap. Real confetti reaches terminal velocity almost immediately. */
const TERMINAL = 240;
/** Clamp for the frame delta, so a backgrounded tab does not fling pieces on return. */
const MAX_DT = 0.032;
/** The burst starts a beat after the tap, overlapping the cover's exit animation. */
const LAUNCH_DELAY_MS = 180;
/** Hard stop, in case a piece gets numerically stuck. */
const MAX_RUNTIME_MS = 6500;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Width, and radius for round shapes. */
  w: number;
  h: number;
  angle: number;
  spin: number;
  /** Rotation about the horizontal axis, faked by scaling drawn height. */
  tilt: number;
  tiltSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  color: string;
  shape: ConfettiShape;
  life: number;
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function between(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makeParticle(
  recipe: ConfettiRecipe,
  x: number,
  y: number,
  baseAngle: number,
  spread: number,
  speedMin: number,
  speedMax: number,
): Particle {
  const angle = baseAngle + between(-spread, spread);
  const speed = between(speedMin, speedMax);
  const shape = pick(recipe.shapes);

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    w: shape === 'circle' ? between(2.5, 4.5) : shape === 'petal' ? between(4, 6.5) : between(6, 9),
    h: shape === 'square' ? between(6, 10) : between(14, 26),
    angle: between(0, Math.PI * 2),
    spin: between(-4, 4),
    tilt: between(0, Math.PI * 2),
    tiltSpeed: between(4, 9) * (Math.random() < 0.5 ? -1 : 1),
    swayPhase: between(0, Math.PI * 2),
    swaySpeed: between(1.5, 3.5),
    color: pick(recipe.colors),
    shape,
    life: 0,
  };
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);

  // Pieces are opaque for most of their life, then dissolve on the way out.
  ctx.globalAlpha = p.life < 2.6 ? 1 : Math.max(0, 1 - (p.life - 2.6) / 0.9);
  ctx.fillStyle = p.color;

  // The tumble. A strip rotating about its horizontal axis presents a foreshortened
  // face, so the drawn height breathes with the cosine of the tilt.
  const face = Math.max(0.12, Math.abs(Math.cos(p.tilt)));

  switch (p.shape) {
    case 'strip':
      ctx.fillRect(-p.w / 2, (-p.h * face) / 2, p.w, p.h * face);
      break;
    case 'square':
      ctx.fillRect(-p.h / 2, (-p.h * face) / 2, p.h, p.h * face);
      break;
    case 'petal':
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w, Math.max(1.2, (p.h / 2) * face), 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, p.w, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
}

export function ConfettiBurst({ recipe }: { recipe: ConfettiRecipe }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /*
     * The canvas measures itself, not the window.
     *
     * It used to read innerWidth and innerHeight, which was invisibly correct only
     * while the invitation always filled the screen. The builder shows it in a panel
     * now, and a canvas is a replaced element: given width and height attributes and no
     * CSS size, it lays out at its intrinsic size, so it became a viewport sized sheet
     * anchored to one edge of the panel and threw confetti across the page behind it.
     * `size-full` in the class list is the other half of this fix and has to stay.
     */
    function measure() {
      return { w: canvas?.clientWidth ?? 0, h: canvas?.clientHeight ?? 0 };
    }

    function size() {
      if (!canvas || !ctx) return;
      const { w, h } = measure();
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      // setTransform rather than scale: resizing resets the context, and stacking
      // scale calls across resizes would compound.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    size();
    window.addEventListener('resize', size);

    const particles: Particle[] = [];
    const timers: number[] = [];
    let frame = 0;
    let last = 0;
    let spawningDone = false;
    const startedAt = performance.now();

    function cannon(
      originXFraction: number,
      baseAngle: number,
      count: number,
      speedMin: number,
      speedMax: number,
    ) {
      const { w, h } = measure();
      for (let i = 0; i < count; i += 1) {
        particles.push(
          makeParticle(recipe, w * originXFraction, h * 0.92, baseAngle, 0.38, speedMin, speedMax),
        );
      }
    }

    function tick(now: number) {
      if (!canvas || !ctx) return;

      const dt = Math.min(MAX_DT, (now - last) / 1000 || 0.016);
      last = now;

      const { w, h } = measure();
      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];

        p.vy = Math.min(TERMINAL + p.h * 1.5, p.vy + GRAVITY * dt);
        // Horizontal drag is heavy, which is what turns a throw into a flutter.
        p.vx *= 1 - 2.2 * dt;

        p.swayPhase += p.swaySpeed * dt;
        p.x += p.vx * dt + Math.sin(p.swayPhase) * 26 * dt;
        p.y += p.vy * dt;

        p.angle += p.spin * dt;
        p.tilt += p.tiltSpeed * dt;
        p.life += dt;

        if (p.y > h + 40 || p.life > 3.6) {
          particles.splice(i, 1);
          continue;
        }

        drawParticle(ctx, p);
      }

      const expired = now - startedAt > MAX_RUNTIME_MS;

      if ((particles.length === 0 && spawningDone) || expired) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      frame = requestAnimationFrame(tick);
    }

    // Two cannons from the bottom corners angled in towards the centre, which is the
    // party popper shape, then a softer volley up the middle a beat later so the sky
    // does not empty all at once.
    const sideCount = Math.round(recipe.count * 0.38);
    const centreCount = recipe.count - sideCount * 2;

    timers.push(
      window.setTimeout(() => {
        cannon(0.06, -Math.PI / 2 + 0.42, sideCount, 620, 1020);
        cannon(0.94, -Math.PI / 2 - 0.42, sideCount, 620, 1020);
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }, LAUNCH_DELAY_MS),
    );

    timers.push(
      window.setTimeout(() => {
        cannon(0.5, -Math.PI / 2, centreCount, 480, 800);
        spawningDone = true;
      }, LAUNCH_DELAY_MS + 420),
    );

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', size);
    };
  }, [recipe]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] size-full"
    />
  );
}
