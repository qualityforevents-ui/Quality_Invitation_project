import { NextResponse } from 'next/server';
import { getByEditToken, isEditable } from '@/lib/invitations';
import { setEditToken } from '@/lib/session';
import { SITE_URL } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The customer's private edit link.
 *
 * It exchanges the token in the URL for the httpOnly cookie the rest of the builder
 * authorises against, then sends them to the form. Doing it this way means the token
 * appears in exactly one place, the address bar of the person who owns it, and never
 * in a request body or in client side JavaScript.
 *
 * This is also how a customer moves their draft to a new phone: open the link there,
 * and that device now holds the cookie.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ editToken: string }> }) {
  const { editToken } = await params;

  const invitation = await getByEditToken(editToken);

  if (!invitation) {
    return NextResponse.redirect(new URL('/', SITE_URL), { status: 302 });
  }

  await setEditToken(invitation.editToken);

  // Anything still editable lands on the form, including a live invitation: this link
  // is what a customer is given precisely so they can fix a venue or a time later, and
  // it is also how the admin reuses the builder rather than growing a second editor.
  // Only a rejected or expired invitation has nothing to edit, so it goes to the screen
  // that explains why.
  const destination = isEditable(invitation) ? '/build' : `/build/status/${invitation.editToken}`;

  return NextResponse.redirect(new URL(destination, SITE_URL), { status: 302 });
}
