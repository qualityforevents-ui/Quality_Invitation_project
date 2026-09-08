'use client';

import { Divider } from '@/components/invitation/Ornaments';
import { Monogram } from '@/components/invitation/Monogram';
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
 * Dark elegant, revealed.
 *
 * High contrast, a thin gold rule down the centre of the page linking the sections, and
 * the practical details in a raised panel. The centre line is what distinguishes this
 * from the other three: it gives a long dark page a spine to follow.
 */
export function MidnightInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-inv-bg">
      <div className="pointer-events-none fixed inset-4 border border-inv-line" aria-hidden="true" />

      <div className="@container relative mx-auto w-full max-w-md px-9 pt-20 pb-24 text-center">
        {/* The spine. Sits behind the content and stops short of both ends. */}
        <span
          className="pointer-events-none absolute inset-y-24 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-inv-line to-transparent"
          aria-hidden="true"
        />

        <Reveal immediate>
          <NamesBlock
            view={view}
            copy={copy}
            nameClassName="text-[2.25rem] leading-[1.45]"
            separator={
              <Monogram name1={view.name1} name2={view.name2} className="my-3" />
            }
          />
        </Reveal>

        <Divider className="my-10" />

        <Reveal immediate delay={0.15}>
          <VerseBlock copy={copy} />
        </Reveal>

        <Divider className="my-10" />

        {/* Empty when the couple chose no line. */}
        {copy.poetry ? (
          <Reveal delay={0.05}>
            <p className="font-inv-body text-[0.9375rem] leading-[2] text-inv-muted text-pretty">
              {copy.poetry}
            </p>
  
            <p className="mt-7 font-inv-body text-sm leading-relaxed text-inv-ink text-pretty">
              {copy.inviteLine[view.eventType]}
            </p>
  
            <RolesBlock view={view} copy={copy} className="mt-9" />
          </Reveal>
        ) : null}

        {/* 5. Photo, when there is one. */}
        <Reveal className="my-10">
          <PhotoFrame view={view} shape="arch" />
        </Reveal>

        <Divider className="my-10" />

        <Reveal>
          <div className="rounded-xl border border-inv-line bg-inv-panel px-6 py-8 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.9)]">
            <DateBlock view={view} copy={copy} />

            <div className="my-7 h-px bg-inv-line" aria-hidden="true" />

            <VenueBlock
              view={view}
              copy={copy}
              buttonClassName="border border-inv-accent/60 px-6 py-3 text-inv-accent"
            />
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <CountdownBlock view={view} copy={copy} />
        </Reveal>

        {view.customMessage ? (
          <>
            <Divider className="my-10" />
            <Reveal>
              <MessageBlock view={view} />
            </Reveal>
          </>
        ) : null}

        <FooterBlock view={view} ornament={<Divider className="mb-8" />} />
      </div>
    </div>
  );
}
