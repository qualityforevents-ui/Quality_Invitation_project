import { redirect } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { getOperator } from '@/lib/admin-auth';
import { isAuthConfigured } from '@/lib/firebase/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await getOperator()) redirect('/admin');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-10">
      <h1 className="text-lg font-bold">qlty admin</h1>
      <p className="mt-1 mb-6 text-sm text-adm-muted">حساب المشغّل فقط.</p>

      {isAuthConfigured() ? (
        <LoginForm />
      ) : (
        <div className="rounded-xl border border-adm-warn/40 bg-adm-warn/10 px-4 py-4 text-sm leading-relaxed text-adm-warn">
          <p className="font-semibold">Firebase لسه مش مضبوط</p>
          <p className="mt-2 text-adm-muted">
            حط FIREBASE_WEB_API_KEY وبيانات الـ service account في ملف .env، واعمل حساب
            المشغّل من لوحة Firebase، Authentication، Users. التفاصيل في SETUP.md خطوة 1.
          </p>
        </div>
      )}
    </main>
  );
}
