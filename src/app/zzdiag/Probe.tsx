'use client';

import { useEffect, useState } from 'react';

/**
 * Temporary diagnostic. Delete once the mobile problem is understood.
 *
 * Everything it reports is rendered as visible text rather than logged, because the
 * device that has the problem is a phone with no console within reach.
 */
export function Probe() {
  const [hydrated, setHydrated] = useState(false);
  const [taps, setTaps] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    setHydrated(true);

    setInfo({
      ua: navigator.userAgent,
      touch: String('ontouchstart' in window),
      pointer: String(typeof window.PointerEvent !== 'undefined'),
      width: `${window.innerWidth}x${window.innerHeight}`,
      dpr: String(window.devicePixelRatio),
      lang: navigator.language,
      cookies: String(navigator.cookieEnabled),
    });

    const onError = (event: ErrorEvent) => {
      setErrors((previous) => [...previous, `${event.message} @ ${event.filename}:${event.lineno}`]);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      setErrors((previous) => [...previous, `unhandled promise: ${String(event.reason)}`]);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7 }}>
      <p
        style={{
          background: hydrated ? '#0b6e4f' : '#a8412f',
          color: '#fff',
          padding: 14,
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        {hydrated ? '1. JAVASCRIPT IS RUNNING' : '1. JAVASCRIPT DID NOT RUN'}
      </p>

      <button
        type="button"
        onClick={() => setTaps((n) => n + 1)}
        style={{
          display: 'block',
          width: '100%',
          padding: 20,
          fontSize: 18,
          fontWeight: 700,
          background: taps > 0 ? '#0b6e4f' : '#333',
          color: '#fff',
          border: 0,
          borderRadius: 12,
          marginBottom: 8,
        }}
      >
        2. TAP ME {taps > 0 ? `— WORKS, ${taps} taps` : '— not tapped yet'}
      </button>

      <p style={{ padding: '4px 0 12px', color: '#666' }}>
        If box 1 is red, or this button never counts up, JavaScript is the problem.
      </p>

      {errors.length > 0 ? (
        <div style={{ background: '#a8412f', color: '#fff', padding: 12, marginBottom: 12 }}>
          <strong>3. ERRORS CAUGHT</strong>
          {errors.map((error, index) => (
            <p key={index} style={{ wordBreak: 'break-all' }}>
              {error}
            </p>
          ))}
        </div>
      ) : (
        <p style={{ background: '#eee', padding: 12, marginBottom: 12 }}>3. no errors caught</p>
      )}

      <div style={{ background: '#eee', padding: 12 }}>
        <strong>4. DEVICE</strong>
        {Object.entries(info).map(([key, value]) => (
          <p key={key} style={{ wordBreak: 'break-all' }}>
            {key}: {value}
          </p>
        ))}
      </div>
    </div>
  );
}
