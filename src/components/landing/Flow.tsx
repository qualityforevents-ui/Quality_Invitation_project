import type { Dictionary } from '@/i18n/ui';
import type { Lang } from '@/generated/prisma/enums';

/**
 * The whole journey, spelled out.
 *
 * People buying an invitation online in this market have usually not done it before, and
 * the two questions they arrive with are "do I have to make an account" and "when
 * exactly do I pay". Both are answered here rather than left to be discovered.
 *
 * Drawn as a vertical line with numbered nodes so it reads as a sequence on a narrow
 * screen without needing a diagram.
 */
export function Flow({ lang, t }: { lang: Lang; t: Dictionary }) {
  const isArabic = lang === 'AR';

  const steps = isArabic
    ? [
        {
          title: 'املا بيانات الفرح',
          body: 'الأسماء، التاريخ، الساعة، المكان. من غير حساب ولا باسورد، وكل حرف بتكتبه بيتحفظ لوحده. تقدر تقفل الصفحة وترجع تكمل بعدين من نفس الموبايل.',
        },
        {
          title: 'اختار التصميم والموسيقى',
          body: 'أربع تصاميم، كل واحد بشكل وخط مختلف، وبتشوف اسمك انت وشريكتك جوه كل تصميم قبل ما تختار. تسمع الموسيقى قبل ما تحطها، وترفع صورة وتحركها جوه الإطار زي ما يعجبك.',
        },
        {
          title: 'شوف الدعوة كاملة',
          body: 'الدعوة بتفتح قدامك بالظبط زي ما الضيف هيشوفها، بالحركة والموسيقى. ده قبل ما تدفع، مش بعده.',
        },
        {
          title: 'حوّل وابعتلنا',
          body: 'تحوّل على إنستاباي، وتضغط زرار واحد يفتحلك واتساب برسالة فيها رقم طلبك جاهزة. ترفق صورة التحويل وتبعت.',
        },
        {
          title: 'نفعّل الرابط',
          body: 'بنراجع التحويل بنفسنا وبنفعّل الدعوة. الصفحة اللي انت عليها بتتحول لوحدها أول ما تتفعّل، وبيوصلك رابطين: واحد تبعته لضيوفك، وواحد للتعديل تحتفظ بيه لنفسك.',
        },
      ]
    : [
        {
          title: 'Fill in the details',
          body: 'Names, date, time, venue. No account and no password, and every keystroke saves itself. Close the page and come back later on the same phone and it will still be there.',
        },
        {
          title: 'Choose a design and music',
          body: 'Four designs, each with its own typography, and you see your own names inside every one before choosing. Listen to the music before you pick it, and drag a photo into the frame until it sits right.',
        },
        {
          title: 'See the whole thing',
          body: 'The invitation opens exactly as a guest will see it, animation and music included. Before you pay, not after.',
        },
        {
          title: 'Pay and send',
          body: 'Transfer over InstaPay, then one button opens WhatsApp with your request number already written. Attach the screenshot and send.',
        },
        {
          title: 'We make it live',
          body: 'A person checks the transfer and activates it. The page you are on updates by itself, and you get two links: one to send your guests, one to edit, which you keep to yourself.',
        },
      ];

  return (
    <section className="border-t border-line pt-10">
      <h2 className="text-xl font-bold">{t.landing.flowTitle}</h2>
      <p className="mt-2 text-sm text-ink-soft">{t.landing.flowSub}</p>

      <ol className="relative mt-7 flex flex-col gap-7">
        {/* The spine. Sits behind the nodes and stops short at both ends. */}
        <span
          className="absolute inset-y-3 start-[0.9375rem] w-px bg-line"
          aria-hidden="true"
        />

        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4">
            <span className="numeric relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold bg-gold-wash text-sm font-bold text-gold-deep">
              {index + 1}
            </span>

            <div className="pt-0.5">
              <h3 className="font-semibold text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft text-pretty">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
