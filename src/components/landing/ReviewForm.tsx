'use client';

import { useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { REVIEW_MAX_BODY, REVIEW_MAX_NAME } from '@/lib/constants';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/generated/prisma/enums';

/**
 * Collapsed until asked for, so it never competes with the buy buttons above it.
 *
 * Submitting does not publish. The confirmation says so plainly rather than implying the
 * review is live, because somebody who writes one and then cannot find it will assume it
 * was lost.
 */
export function ReviewForm({ lang, t }: { lang: Lang; t: Dictionary }) {
  const isArabic = lang === 'AR';

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const copy = isArabic
    ? {
        name: 'اسمك',
        namePlaceholder: 'مروة و أحمد',
        city: 'المدينة',
        cityPlaceholder: 'القاهرة',
        body: 'رأيك',
        bodyPlaceholder: 'احكيلنا تجربتك مع الدعوة',
        send: 'ابعت رأيك',
        sending: 'بيتبعت',
        done: 'وصلنا رأيك، شكراً. هيتنشر بعد ما نراجعه.',
        error: 'مقدرناش نبعت رأيك. جرب تاني.',
        note: 'الآراء بتتراجع قبل ما تتنشر.',
      }
    : {
        name: 'Your name',
        namePlaceholder: 'Marwa and Ahmed',
        city: 'City',
        cityPlaceholder: 'Cairo',
        body: 'Your review',
        bodyPlaceholder: 'Tell us how it went',
        send: 'Send review',
        sending: 'Sending',
        done: 'Thank you, we have it. It will appear once we have read it.',
        error: 'We could not send that. Please try again.',
        note: 'Reviews are read before they are published.',
      };

  async function submit() {
    if (name.trim().length < 2 || body.trim().length < 10) return;

    setState('sending');
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, city, body }),
      });
      setState(response.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <p className="rise mt-6 rounded-xl border border-success/30 bg-success/5 px-4 py-4 text-sm text-success">
        {copy.done}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass('secondary', 'mt-6 w-full')}>
        {t.landing.reviewsCta}
      </button>
    );
  }

  const field =
    'w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25';

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white px-4 py-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{copy.name}</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={REVIEW_MAX_NAME}
          placeholder={copy.namePlaceholder}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">
          {copy.city} <span className="text-xs font-normal text-ink-faint">{t.common.optional}</span>
        </span>
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
          maxLength={60}
          placeholder={copy.cityPlaceholder}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex items-baseline justify-between text-sm font-medium text-ink">
          {copy.body}
          <span className="text-xs font-normal text-ink-faint">
            <span className="numeric">{REVIEW_MAX_BODY - body.length}</span> {t.build.charactersLeft}
          </span>
        </span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={REVIEW_MAX_BODY}
          rows={4}
          placeholder={copy.bodyPlaceholder}
          className={`${field} resize-none`}
        />
      </label>

      {state === 'error' ? <p className="rise text-xs text-danger">{copy.error}</p> : null}

      <p className="text-xs text-ink-faint">{copy.note}</p>

      <button
        type="button"
        onClick={submit}
        disabled={state === 'sending' || name.trim().length < 2 || body.trim().length < 10}
        className={buttonClass('primary', 'w-full')}
      >
        {state === 'sending' ? copy.sending : copy.send}
      </button>
    </div>
  );
}
