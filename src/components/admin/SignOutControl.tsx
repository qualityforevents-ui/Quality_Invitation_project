'use client';

import { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/admin/login/actions';

/**
 * Sign out, behind one confirmation.
 *
 * It sits on every screen because there is nowhere else for it to live on a surface
 * with four tabs and no settings page. That makes it permanently adjacent to the back
 * arrow and the title, so it asks before it throws the session away.
 */
export function SignOutControl() {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!armed) return;
    timerRef.current = window.setTimeout(() => setArmed(false), 4000);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [armed]);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label="خروج"
        className="press tap-target -me-2 flex items-center justify-center rounded-lg px-2 text-adm-muted"
      >
        <LogOut aria-hidden className="size-4.5 rtl:rotate-180" />
      </button>
    );
  }

  return (
    <form action={signOut}>
      <button
        type="submit"
        autoFocus
        className="press tap-target -me-2 rounded-lg px-2.5 text-xs font-bold text-adm-danger"
      >
        اخرج؟
      </button>
    </form>
  );
}
