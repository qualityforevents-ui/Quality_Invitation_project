'use client';

import { useActionState } from 'react';
import { SubmitButton } from '@/components/admin/ActionButton';
import { signIn, type LoginState } from './actions';

const FIELD =
  'w-full rounded-xl border border-adm-control bg-adm-panel px-4 py-3 text-adm-text outline-none focus:border-adm-accent focus:ring-2 focus:ring-adm-accent/25';

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(signIn, { error: null });

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-adm-muted">الإيميل</span>
        <input name="email" type="email" dir="ltr" required autoComplete="username" className={FIELD} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-adm-muted">الباسورد</span>
        <input
          name="password"
          type="password"
          dir="ltr"
          required
          autoComplete="current-password"
          className={FIELD}
        />
      </label>

      {state.error ? (
        <p role="alert" className="rounded-lg bg-adm-danger/10 px-3 py-2 text-sm text-adm-danger">
          {state.error}
        </p>
      ) : null}

      <SubmitButton size="lg" pendingLabel="بيتم الدخول">
        دخول
      </SubmitButton>
    </form>
  );
}
