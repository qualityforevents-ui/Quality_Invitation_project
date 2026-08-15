/**
 * Copies text to the clipboard, with a fallback for the cases where the modern API is
 * not there.
 *
 * navigator.clipboard requires a secure context, which plain http over a local network
 * is not, and testing this app on a real phone means exactly that. Without the fallback
 * the copy buttons look broken on the device they most need to work on.
 *
 * Shared rather than kept inside CopyField, because the payment buttons need it too:
 * they copy the recipient as they hand off to the banking app, so that a customer whose
 * app opens on its own home screen still has the address ready to paste.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through and try the older route.
  }

  try {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(area);
    return copied;
  } catch {
    return false;
  }
}
