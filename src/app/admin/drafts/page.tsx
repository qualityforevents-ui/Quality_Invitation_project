import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { AdminHeader, EmptyState } from '@/components/admin/AdminChrome';
import { requireOperator } from '@/lib/admin-auth';
import { formatWaited, listByStatus } from '@/lib/admin-queries';
import { packagePrice } from '@/lib/packages';
import { buildDraftNudgeMessage, customerWhatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

/**
 * Everyone who built an invitation and never paid.
 *
 * This is the warmest list in the product: they chose names, a date and a venue, saw
 * the finished thing, and stopped. Surfaced with phone numbers where there are any,
 * because that is the difference between a list and a follow up.
 *
 * The number used to be the whole of it — a phone-shaped link that opened an empty
 * chat, leaving the operator to write the same message from scratch each time and to go
 * find the request id it needed to quote. It carries the message now.
 */
export default async function DraftsPage() {
  await requireOperator();

  const drafts = await listByStatus('DRAFT');
  const withPhone = drafts.filter((d) => d.customerPhone);

  return (
    <>
      <AdminHeader title="المسودات" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-4 pb-28">
        <p className="text-xs leading-relaxed text-adm-muted">
          ناس بنت دعوة ومكملتش. <span className="numeric">{withPhone.length}</span> من{' '}
          <span className="numeric">{drafts.length}</span> سايبين رقم موبايل.
        </p>

        {drafts.length === 0 ? (
          <EmptyState>مفيش مسودات.</EmptyState>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-stretch gap-1 rounded-2xl border border-adm-line bg-adm-panel"
            >
              <Link
                href={`/admin/invitation/${draft.id}`}
                className="press-soft min-w-0 flex-1 rounded-2xl px-3.5 py-3"
              >
                <p className="truncate text-sm font-bold">
                  {draft.name1 || '؟'} <span className="font-normal text-adm-muted">&amp;</span>{' '}
                  {draft.name2 || '؟'}
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-xs text-adm-muted">
                  <span className="numeric font-semibold text-adm-accent">
                    {packagePrice(draft.package)} ج
                  </span>
                  <span aria-hidden>·</span>
                  <span>{formatWaited(draft.createdAt)}</span>
                </p>
              </Link>

              {draft.customerPhone ? (
                <a
                  href={customerWhatsappLink(
                    draft.customerPhone,
                    buildDraftNudgeMessage(draft.requestId, draft.name1, draft.name2),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press tap-target my-2 me-2 flex shrink-0 items-center gap-1.5 rounded-xl border border-adm-success/40 px-3 text-xs font-semibold text-adm-success"
                >
                  <MessageCircle aria-hidden className="size-4" />
                  ذكّره
                </a>
              ) : (
                <span className="my-2 me-3 flex shrink-0 items-center text-xs text-adm-muted">
                  مفيش رقم
                </span>
              )}
            </div>
          ))
        )}
      </main>
    </>
  );
}
