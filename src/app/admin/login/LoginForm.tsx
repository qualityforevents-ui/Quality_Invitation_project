'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { signIn, type LoginState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="tap-target w-full rounded-xl bg-adm-accent px-5 py-3.5 text-base font-semibold text-adm-bg transition active:scale-[0.98] disabled:opacity-50"
    >
      {pending ? 'بيتم الدخول' : 'دخول'}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(signIn, { error: null });

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-adm-muted">الإيميل</span>
        <input
          name="email"
          type="email"
          dir="ltr"
          required
          autoComplete="username"
          className="w-full rounded-xl border border-adm-line bg-adm-raised px-4 py-3 text-adm-text outline-none focus:border-adm-accent"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-adm-muted">الباسورد</span>
        <input
          name="password"
          type="password"
          dir="ltr"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-adm-line bg-adm-raised px-4 py-3 text-adm-text outline-none focus:border-adm-accent"
        />
      </label>

      {state.error ? (
        <p className="rounded-lg bg-adm-danger/10 px-3 py-2 text-sm text-adm-danger">{state.error}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
