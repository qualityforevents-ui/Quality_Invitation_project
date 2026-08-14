import { Probe } from './Probe';

export const dynamic = 'force-dynamic';

/**
 * Temporary diagnostic route. Delete once the mobile problem is understood.
 *
 * The inline script below is the important part. The React probe underneath can only
 * report anything once the bundle has loaded and hydrated, so if the bundle is what is
 * failing, it stays silent and tells you nothing. This runs first, as a plain classic
 * script, and writes straight into the DOM: it catches parse errors, module loading
 * failures and blocked resources, all of which happen before React exists.
 */
const INLINE_PROBE = `
(function () {
  var lines = [];
  function flush() {
    var box = document.getElementById('inline-out');
    if (!box) return;
    box.textContent = '';
    for (var i = 0; i < lines.length; i++) {
      var p = document.createElement('p');
      p.style.margin = '2px 0';
      p.style.wordBreak = 'break-all';
      p.textContent = lines[i];
      box.appendChild(p);
    }
  }
  function write(msg) { lines.push(msg); flush(); }

  // Anything that fails to load fires an error event on the element, captured here.
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'SCRIPT' || t.tagName === 'LINK')) {
      write('BLOCKED OR 404: ' + (t.src || t.href || '(inline)'));
    } else {
      write('JS ERROR: ' + e.message + ' @ ' + (e.filename || '?') + ':' + (e.lineno || '?'));
    }
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    write('PROMISE REJECTED: ' + String(e.reason));
  });

  write('inline classic script: RAN');
  write('ES modules supported: ' + ('noModule' in HTMLScriptElement.prototype));

  document.addEventListener('DOMContentLoaded', function () {
    flush();
    var scripts = document.querySelectorAll('script[src]');
    write('script tags found: ' + scripts.length);
    if (scripts.length) write('first script src: ' + scripts[0].src);

    // Can the page fetch its own bundle at all?
    if (scripts.length && window.fetch) {
      fetch(scripts[0].src)
        .then(function (r) { write('fetch of first script: HTTP ' + r.status); })
        .catch(function (err) { write('fetch of first script FAILED: ' + err.message); });
    }
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      write('window load fired, modules ran: ' + (window.__moduleRan ? 'YES' : 'NO'));
    }, 1500);
  });
})();
`;

/** A module script. If classic JS runs but this does not, module loading is blocked. */
const MODULE_PROBE = `window.__moduleRan = true;`;

export default function DiagnosticPage() {
  return (
    <div style={{ padding: 16, maxWidth: 520, margin: '0 auto', background: '#fff', color: '#111' }}>
      <script dangerouslySetInnerHTML={{ __html: INLINE_PROBE }} />
      <script type="module" dangerouslySetInnerHTML={{ __html: MODULE_PROBE }} />

      <h1 style={{ fontFamily: 'monospace', fontSize: 16 }}>qlty diagnostic</h1>

      {/* The inline script rewrites this before React sees it, which is a hydration
          mismatch by definition. Suppressed so the diagnostic does not report itself. */}
      <div
        id="inline-out"
        suppressHydrationWarning
        style={{
          fontFamily: 'monospace',
          fontSize: 12,
          background: '#111',
          color: '#0f0',
          padding: 12,
          margin: '12px 0',
          minHeight: 90,
        }}
      >
        inline script did not run
      </div>

      <Probe />
    </div>
  );
}
