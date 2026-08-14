'use client';

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

/** A hairline, which is this theme's entire vocabulary of ornament. */
function Rule({ className = 'my-12' }: { className?: string }) {
  return <span className={`mx-auto block h-px w-14 bg-inv-line ${className}`} aria-hidden="true" />;
}

/**
 * Modern minimal, revealed.
 *
 * Sections are separated by space rather than by ornament, the type is light and small
 * apart from the names, and nothing is boxed. Where the classic theme gathers the
 * practical details into a panel, this one lets them stand in the open with more air
 * around them, which is the whole difference between the two.
 */
export function ModernInvitation({ view, copy }: { view: InvitationView; copy: InvitationCopy }) {
  return (
    <div className="relative min-h-dvh bg-inv-bg">
      <div className="@container relative mx-auto w-full max-w-md px-9 pt-20 pb-28 text-center">
        <Reveal immediate>
          <NamesBlock
            view={view}
            copy={copy}
            nameClassName="text-[2.125rem] leading-tight font-light"
            separator={<Rule className="my-4" />}
          />
        </Reveal>

        <Rule />

        <Reveal immediate delay={0.15}>
          <VerseBlock copy={copy} bismillahClassName="text-[length:min(1.75rem,7cqw)]" />
        </Reveal>

        <Rule />

        <Reveal delay={0.05}>
          <p className="font-inv-body text-sm leading-[2.1] text-inv-muted text-pretty">
            {copy.poetry}
          </p>

          <p className="mt-8 font-inv-body text-sm leading-relaxed text-inv-ink text-pretty">
            {copy.inviteLine[view.eventType]}
          </p>

          <RolesBlock view={view} copy={copy} className="mt-10" nameClassName="text-lg font-light" />
        </Reveal>

        {/* 5. Photo, when there is one. */}
        <Reveal className="my-12">
          <PhotoFrame view={view} shape="square" />
        </Reveal>

        <Rule />

        <Reveal>
          <DateBlock view={view} copy={copy} />
        </Reveal>

        <Rule />

        <Reveal>
          <CountdownBlock view={view} copy={copy} />
        </Reveal>

        <Rule />

        <Reveal>
          <VenueBlock
            view={view}
            copy={copy}
            buttonClassName="border-b border-inv-line px-1 pb-1.5 rounded-none text-inv-ink"
          />
        </Reveal>

        {view.customMessage ? (
          <>
            <Rule />
            <Reveal>
              <MessageBlock view={view} />
            </Reveal>
          </>
        ) : null}

        <FooterBlock view={view} ornament={<Rule className="mb-8" />} />
      </div>
    </div>
  );
}
