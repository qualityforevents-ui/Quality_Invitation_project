import { NextResponse } from 'next/server';
import { createUploadAuth, isImageKitConfigured, IMAGEKIT_PUBLIC_KEY } from '@/lib/imagekit';
import { getEditToken } from '@/lib/session';
import { getByEditToken, isEditable } from '@/lib/invitations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hands the browser a short lived signature so it can upload one photo directly to
 * ImageKit.
 *
 * Gated on holding the edit cookie for an editable invitation. Without that check this
 * would be an open endpoint minting upload credentials for anyone who found it, and
 * ImageKit storage is a fixed 3GB on the free plan.
 */
export async function GET() {
  if (!isImageKitConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'ImageKit is not configured. See SETUP.md step 7.' },
      { status: 503 },
    );
  }

  const token = await getEditToken();
  const invitation = token ? await getByEditToken(token) : null;

  if (!invitation || !isEditable(invitation)) {
    return NextResponse.json({ ok: false, error: 'No editable invitation' }, { status: 401 });
  }

  const auth = createUploadAuth();

  return NextResponse.json({
    ok: true,
    ...auth,
    publicKey: IMAGEKIT_PUBLIC_KEY,
    // Named after the invitation so the operator can find a customer's photo, and so a
    // re upload replaces the old one rather than leaving it orphaned in storage.
    fileName: `${invitation.id}.jpg`,
    folder: '/invitations',
  });
}
