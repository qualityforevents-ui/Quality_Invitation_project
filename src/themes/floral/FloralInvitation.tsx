'use client';

import { FloralDivider, Sprig } from './FloralOrnaments';
import { Reveal } from '@/components/invitation/Reveal';
import {
  CountdownBlock,
  DateBlock,
  FooterBlock,
  MessageBlock,
  NamesBlock,
  PhotoFrame,
  RolesBlock,
  VenueBlock,
  VerseBlock,
} from '../sections';
import type { InvitationCopy } from '@/i18n/invitation';
import type { InvitationView } from '@/lib/invitation-view';

/**
 * Floral soft, revealed.
 *
 * Rounded rather than ruled: the details sit in a softly rounded card and the sprigs
 * reappear at the head and foot of the page. Where classic is symmetrical and formal,
 * this one is deliberately a little looser.
 */
export function FloralInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg">
      <Sprig className="pointer-events-none absolute top-2 left-2 h-20 w-20 text-inv-accent-soft opacity-70" />
      <Sprig className="pointer-events-none absolute right-2 bottom-2 h-20 w-20 rotate-180 text-inv-accent-soft opacity-70" />

      <div className="@container relative mx-auto w-full max-w-md px-9 pt-20 pb-24 text-center">
        <Reveal immediate>
          <NamesBlock
            view={view}
            copy={copy}
            nameClassName="text-[2.375rem] leading-[1.4]"
            separator={
              <span className="my-1 block text-xl text-inv-accent" aria-hidden="true">
                {copy.nameSeparator}
              </span>
            }
          />
        </Reveal>

        <FloralDivider className="my-10" />

        <Reveal immediate delay={0.15}>
          <VerseBlock copy={copy} />
        </Reveal>

        <FloralDivider className="my-10" />

        {/* Empty when the couple chose no line. */}
        {copy.poetry ? (
          <Reveal delay={0.05}>
            <p className="font-inv-body text-[0.9375rem] leading-[2] text-inv-muted italic text-pretty">
              {copy.poetry}
            </p>
  
            <p className="mt-7 font-inv-body text-sm leading-relaxed text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
  
            <RolesBlock view={view} copy={copy} className="mt-8" />
          </Reveal>
        ) : null}

        {/* 5. Photo, when there is one. */}
        <Reveal className="my-10">
          <PhotoFrame view={view} shape="rounded" />
        </Reveal>

        <FloralDivider className="my-10" />

        {/* Softly rounded rather than the classic theme's squared panel. */}
        <Reveal>
          <div className="rounded-[2rem] border border-inv-line bg-inv-panel/50 px-6 py-8">
            <DateBlock view={view} copy={copy} />

            <div className="my-7 flex justify-center" aria-hidden="true">
              <span className="h-px w-16 bg-inv-line" />
            </div>

            <VenueBlock
              view={view}
              copy={copy}
              buttonClassName="border border-inv-accent/50 bg-inv-bg/70 px-6 py-3 text-inv-ink"
            />
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <CountdownBlock view={view} copy={copy} />
        </Reveal>

        {view.customMessage ? (
          <>
            <FloralDivider className="my-10" />
            <Reveal>
              <MessageBlock view={view} />
            </Reveal>
          </>
        ) : null}

        <FooterBlock view={view} ornament={<FloralDivider className="mb-8" />} />
      </div>
    </div>
  );
}
