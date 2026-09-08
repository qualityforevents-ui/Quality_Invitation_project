'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { REVIEW_MAX_BODY, REVIEW_MAX_NAME } from '@/lib/constants';
import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/lib/types';

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
        namePlaceholder: 'مثال: مروة و أحمد',
        city: 'المدينة',
        cityPlaceholder: 'مثال: القاهرة',
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
        namePlaceholder: 'e.g. Marwa and Ahmed',
        city: 'City',
        cityPlaceholder: 'e.g. Cairo',
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
      <p className="rise mt-6 flex items-start gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-4 text-sm text-success">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {copy.done}
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        className="mt-6 w-full rounded-full"
      >
        {t.landing.reviewsCta}
      </Button>
    );
  }

  return (
    <div className="rise mt-6 flex flex-col gap-4 rounded-2xl border bg-card px-4 py-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-name">{copy.name}</Label>
        <Input
          id="review-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={REVIEW_MAX_NAME}
          placeholder={copy.namePlaceholder}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-city">
          {copy.city}
          <span className="ms-2 text-xs font-normal text-muted-foreground">{t.common.optional}</span>
        </Label>
        <Input
          id="review-city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          maxLength={60}
          placeholder={copy.cityPlaceholder}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="review-body">{copy.body}</Label>
          <span className="text-xs text-muted-foreground">
            <span className="numeric">{REVIEW_MAX_BODY - body.length}</span> {t.build.charactersLeft}
          </span>
        </div>
        <Textarea
          id="review-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={REVIEW_MAX_BODY}
          rows={4}
          placeholder={copy.bodyPlaceholder}
          className="resize-none"
        />
      </div>

      {state === 'error' ? <p className="rise text-xs text-destructive">{copy.error}</p> : null}

      <p className="text-xs text-muted-foreground">{copy.note}</p>

      <Button
        type="button"
        size="lg"
        onClick={submit}
        disabled={state === 'sending' || name.trim().length < 2 || body.trim().length < 10}
        className="w-full rounded-full"
      >
        {state === 'sending' ? copy.sending : copy.send}
      </Button>
    </div>
  );
}
