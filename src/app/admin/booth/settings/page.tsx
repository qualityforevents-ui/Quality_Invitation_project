import { revalidatePath } from 'next/cache';
import { TriangleAlert } from 'lucide-react';
import { AdminHeader, SectionHeading } from '@/components/admin/AdminChrome';
import { SubmitButton } from '@/components/admin/ActionButton';
import { assertOperator, requireOperator } from '@/lib/admin-auth';
import { formatShortDateTime } from '@/lib/format';
import { isNotionConfigured } from '@/lib/notion/client';
import { getSyncState, runIncrementalSync } from '@/lib/notion/reconcile';
import { getBoothSyncTrouble } from '@/lib/photobooth/admin-queries';
import { getBoothSettings } from '@/lib/photobooth/reservations';
import { BOOTH_CONFIG_IS_PLACEHOLDER } from '@/lib/photobooth/config';
import { saveSettings } from '../actions';

export const dynamic = 'force-dynamic';

const WEEKDAYS = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاتنين' },
  { value: 2, label: 'التلات' },
  { value: 3, label: 'الأربع' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

/**
 * Runs a sync on demand.
 *
 * Here rather than in actions.ts because it is the only action on this screen and it
 * belongs to this screen: it is the operator's answer to "Notion looks wrong" and it
 * has no other caller.
 *
 * Awaited rather than deferred to `after()`, unlike every other Notion call in the
 * admin. The operator pressed this button precisely to find out what happens, so making
 * them wait and then showing them the result is the point of it.
 */
async function syncNow(): Promise<void> {
  'use server';
  await assertOperator();

  await runIncrementalSync();

  revalidatePath('/admin/booth/settings');
  revalidatePath('/admin/booth');
  revalidatePath('/admin/booth/calendar');
}

export default async function BoothSettingsPage() {
  await requireOperator();

  const [settings, syncState, trouble] = await Promise.all([
    getBoothSettings(),
    getSyncState(),
    getBoothSyncTrouble(),
  ]);

  return (
    <>
      <AdminHeader title="إعدادات الفوتوبوث" back="/admin/booth" />

      <main className="mx-auto w-full max-w-lg px-4 pt-4 pb-28">
        {BOOTH_CONFIG_IS_PLACEHOLDER ? (
          <p className="mb-5 flex items-start gap-2 rounded-2xl border border-adm-warn/50 bg-adm-warn/8 px-4 py-3 text-xs leading-relaxed text-adm-warn">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              الأسعار والباقات والصور لسه مؤقتة. بتتغير في{' '}
              <span className="font-mono">src/lib/photobooth/config.ts</span> مش من هنا، لأنها
              بتأثر على السعر اللي العميل بيشوفه.
            </span>
          </p>
        ) : null}

        <form action={saveSettings} className="flex flex-col gap-4">
          <Number
            label="عدد الفوتوبوثات"
            name="unitCount"
            defaultValue={settings.unitCount}
            hint="ده السقف. مش هيتحجز في اليوم أكتر من العدد ده من الموقع."
          />

          <Number
            label="أقل مهلة قبل الفرح، بالأيام"
            name="minNoticeDays"
            defaultValue={settings.minNoticeDays}
            hint="٢ يعني مفيش حجز النهاردة ولا بكرة."
          />

          <Number
            label="أبعد يوم ينفع يتحجز، بالأيام"
            name="maxAdvanceDays"
            defaultValue={settings.maxAdvanceDays}
          />

          <Number
            label="مدة الحجز المؤقت، بالساعات"
            name="holdHours"
            defaultValue={settings.holdHours}
            hint="أول ما العميل يفتح واتساب، اليوم بيتقفل المدة دي لحد ما العربون يوصل."
          />

          <fieldset>
            <legend className="text-xs font-medium text-adm-muted">أيام مابنشتغلش فيها</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-1.5 rounded-xl border border-adm-control bg-adm-panel px-3 py-2 text-xs"
                >
                  {/* Unticked days simply are not in the FormData, which is why the
                      action reads getAll rather than looking for false. */}
                  <input
                    type="checkbox"
                    name="closedWeekdays"
                    value={day.value}
                    defaultChecked={settings.closedWeekdays.includes(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-xs font-medium text-adm-muted">أيام مقفولة</span>
            <span className="mt-0.5 block text-[0.6875rem] text-adm-muted">
              تاريخ في كل سطر، بالشكل ده: 2026-03-14
            </span>
            <textarea
              name="blackoutDates"
              rows={4}
              dir="ltr"
              defaultValue={settings.blackoutDates.join('\n')}
              className="numeric mt-1.5 w-full rounded-xl border border-adm-control bg-adm-panel px-3 py-2 text-sm outline-none"
            />
          </label>

          <SubmitButton pendingLabel="بيتحفظ">احفظ الإعدادات</SubmitButton>
        </form>

        {/* ---------------------------------------------------------------- Notion */}

        <section className="mt-10">
          <SectionHeading>المزامنة مع Notion</SectionHeading>

          <div className="mt-3 rounded-2xl border border-adm-line bg-adm-panel p-4">
            {!isNotionConfigured() ? (
              <p className="text-xs leading-relaxed text-adm-muted">
                Notion مش متظبط لسه. محتاج{' '}
                <span className="font-mono">NOTION_TOKEN</span> و{' '}
                <span className="font-mono">NOTION_BOOTH_DATA_SOURCE_ID</span>. الخطوات في{' '}
                <span className="font-mono">docs/notion-booth-setup.md</span>.
              </p>
            ) : (
              <dl className="flex flex-col gap-2 text-xs">
                <Row
                  label="آخر مزامنة"
                  value={
                    syncState.lastIncrementalRunAt
                      ? formatShortDateTime(syncState.lastIncrementalRunAt, 'AR')
                      : 'لسه محصلتش'
                  }
                />
                <Row
                  label="آخر مراجعة كاملة"
                  value={
                    syncState.lastFullReconcileAt
                      ? formatShortDateTime(syncState.lastFullReconcileAt, 'AR')
                      : 'لسه محصلتش'
                  }
                />
                <Row
                  label="آخر webhook"
                  value={
                    syncState.lastWebhookAt
                      ? formatShortDateTime(syncState.lastWebhookAt, 'AR')
                      : 'لسه محصلش'
                  }
                />
                <Row label="حجوزات مزامنتها وقعت" value={String(trouble)} />
              </dl>
            )}

            {syncState.lastError ? (
              <p className="mt-3 rounded-xl border border-adm-danger/40 bg-adm-danger/8 px-3 py-2 text-[0.6875rem] break-words text-adm-danger">
                {syncState.lastError}
              </p>
            ) : null}

            <form action={syncNow} className="mt-4">
              <SubmitButton variant="secondary" pendingLabel="بيزامن دلوقتي">
                زامن مع Notion دلوقتي
              </SubmitButton>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

function Number({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-adm-muted">{label}</span>
      {hint ? <span className="mt-0.5 block text-[0.6875rem] text-adm-muted">{hint}</span> : null}
      <input
        type="number"
        name={name}
        min={0}
        defaultValue={defaultValue}
        className="numeric mt-1.5 h-11 w-full rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-adm-muted">{label}</dt>
      <dd className="numeric text-end font-medium">{value}</dd>
    </div>
  );
}
