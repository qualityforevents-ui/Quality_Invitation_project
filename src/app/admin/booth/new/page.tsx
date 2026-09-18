import { AdminHeader } from '@/components/admin/AdminChrome';
import { SubmitButton } from '@/components/admin/ActionButton';
import { requireOperator } from '@/lib/admin-auth';
import { todayInCairo } from '@/lib/format';
import { BOOTH_AREAS, BOOTH_PACKAGES, DEFAULT_BOOTH_PACKAGE } from '@/lib/photobooth/config';
import { createManualBooking } from '../actions';

export const dynamic = 'force-dynamic';

/**
 * A booking taken on the phone, or over Instagram, or in person.
 *
 * Most of this business's bookings will start as a conversation rather than as a form
 * submission, so this screen is not a fallback: it is the main way bookings get into
 * the system in the first year.
 *
 * It is born CONFIRMED by default, because the operator typing it in has already had
 * the conversation and agreed the date. Leaving it REQUESTED would mean it did not hold
 * the day, and the first anybody would know is a second customer booking the same night
 * through the website.
 */
export default async function NewBoothBookingPage() {
  await requireOperator();

  return (
    <>
      <AdminHeader title="حجز جديد" back="/admin/booth" subtitle="حجز بالتليفون أو إنستجرام" />

      <main className="mx-auto w-full max-w-lg px-4 pt-4 pb-28">
        <form action={createManualBooking} className="flex flex-col gap-3">
          <Field
            label="اليوم"
            name="eventDate"
            type="date"
            required
            defaultValue={todayInCairo()}
            numeric
          />

          <div className="grid grid-cols-2 gap-3">
            <Field label="الساعة" name="startTime" type="time" defaultValue="20:00" numeric />
            <Field label="عدد الساعات" name="hours" type="number" defaultValue="4" numeric />
          </div>

          <Select label="الباقة" name="packageId" defaultValue={DEFAULT_BOOTH_PACKAGE}>
            {BOOTH_PACKAGES.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.nameAr} · {tier.price}
              </option>
            ))}
          </Select>

          {/* Empty means "whatever the package costs". The operator types a number here
              only when they have agreed something different on the phone. */}
          <Field label="السعر، سيبه فاضي للسعر العادي" name="price" type="number" numeric />

          <Field label="الاسم" name="customerName" required />
          <Field label="الموبايل" name="customerPhone" dir="ltr" inputMode="numeric" numeric />
          <Field label="المكان" name="venue" />

          <Select label="المنطقة" name="area" defaultValue={BOOTH_AREAS[0].id}>
            {BOOTH_AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {area.nameAr}
              </option>
            ))}
          </Select>

          <Select label="المناسبة" name="eventType" defaultValue="WEDDING">
            <option value="WEDDING">فرح</option>
            <option value="ENGAGEMENT">خطوبة</option>
            <option value="KATB_KETAB">كتب كتاب</option>
            <option value="BIRTHDAY">عيد ميلاد</option>
            <option value="CORPORATE">مناسبة شركة</option>
            <option value="OTHER">حاجة تانية</option>
          </Select>

          <Select label="الحالة" name="status" defaultValue="CONFIRMED">
            <option value="CONFIRMED">مأكد</option>
            <option value="HELD">محجوز مؤقت</option>
            <option value="REQUESTED">طلب</option>
          </Select>

          <label className="block">
            <span className="text-xs font-medium text-adm-muted">ملاحظات</span>
            <textarea
              name="notes"
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-adm-control bg-adm-panel px-3 py-2 text-sm outline-none"
            />
          </label>

          <SubmitButton size="lg" pendingLabel="بيتسجل">
            سجّل الحجز
          </SubmitButton>
        </form>
      </main>
    </>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  dir,
  inputMode,
  numeric,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  dir?: 'ltr';
  inputMode?: 'numeric';
  numeric?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-adm-muted">{label}</span>
      <input
        name={name}
        type={type}
        dir={dir}
        inputMode={inputMode}
        required={required}
        defaultValue={defaultValue}
        className={`mt-1.5 h-11 w-full rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none ${numeric ? 'numeric' : ''}`}
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-adm-muted">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1.5 h-11 w-full rounded-xl border border-adm-control bg-adm-panel px-3 text-sm outline-none"
      >
        {children}
      </select>
    </label>
  );
}
