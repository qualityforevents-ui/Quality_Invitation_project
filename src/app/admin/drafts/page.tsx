import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminChrome';
import { requireOperator } from '@/lib/admin-auth';
import { listByStatus } from '@/lib/admin-queries';
import { formatShortDateTime } from '@/lib/format';
import { customerWhatsappLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

/**
 * Everyone who built an invitation and never paid.
 *
 * This is the warmest list in the product: they chose names, a date and a venue, saw
 * the finished thing, and stopped. Surfaced with phone numbers where there are any,
 * because that is the difference between a list and a follow up.
 */
export default async function DraftsPage() {
  await requireOperator();

  const drafts = await listByStatus('DRAFT');
  const withPhone = drafts.filter((d) => d.customerPhone);

  return (
    <>
      <AdminHeader title="المسودات" back="/admin" />

      <main className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-4 pb-16">
        <p className="text-xs leading-relaxed text-adm-muted">
          ناس بنت دعوة ومكملتش. <span className="numeric">{withPhone.length}</span> منهم سايبين رقم
          موبايل.
        </p>

        {drafts.length === 0 ? (
          <p className="rounded-xl border border-adm-line bg-adm-panel px-4 py-6 text-center text-sm text-adm-muted">
            مفيش مسودات
          </p>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center gap-3 rounded-xl border border-adm-line bg-adm-panel px-3.5 py-3"
            >
              <Link href={`/admin/invitation/${draft.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {draft.name1 || '؟'} <span className="text-adm-muted">&amp;</span>{' '}
                  {draft.name2 || '؟'}
                </p>
                <p className="mt-1 text-xs text-adm-muted">
                  {formatShortDateTime(draft.createdAt, 'AR')}
                </p>
              </Link>

              {draft.customerPhone ? (
                <a
                  href={customerWhatsappLink(draft.customerPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                  className="tap-target shrink-0 rounded-lg border border-adm-accent/40 px-3 py-2 font-mono text-xs text-adm-accent"
                >
                  {draft.customerPhone}
                </a>
              ) : (
                <span className="shrink-0 text-xs text-adm-muted">مفيش رقم</span>
              )}
            </div>
          ))
        )}
      </main>
    </>
  );
}
