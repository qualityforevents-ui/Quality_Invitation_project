import { reviews, toDateOr } from './db';
import { REVIEW_MAX_BODY, REVIEW_MAX_NAME } from './constants';
import type { DocumentData, DocumentSnapshot } from 'firebase-admin/firestore';
import type { Review } from './types';

export { REVIEW_MAX_BODY, REVIEW_MAX_NAME } from './constants';

function mapReview(doc: DocumentSnapshot<DocumentData>): Review {
  const data = doc.data() ?? {};

  return {
    id: doc.id,
    status: data.status ?? 'PENDING',
    name: String(data.name ?? ''),
    city: data.city ?? null,
    body: String(data.body ?? ''),
    invitationId: data.invitationId ?? null,
    createdAt: toDateOr(data.createdAt, new Date(0)),
  };
}

/**
 * The reviews shown publicly.
 *
 * Approved only, and never anything a customer wrote a moment ago. A form that writes
 * straight onto a public page is a spam target, and the people reading these are
 * deciding whether to trust an unfamiliar business with their wedding.
 *
 * Returns an empty list rather than throwing if the database is unreachable, because a
 * reviews section is not worth taking the landing page down for.
 */
export async function getApprovedReviews(limit = 12): Promise<Review[]> {
  try {
    const snapshot = await reviews()
      .where('status', '==', 'APPROVED')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(mapReview);
  } catch (error) {
    console.error('[reviews] could not load approved reviews', error);
    return [];
  }
}

export async function getPendingReviews(): Promise<Review[]> {
  const snapshot = await reviews()
    .where('status', '==', 'PENDING')
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();

  return snapshot.docs.map(mapReview);
}

export async function getAllReviews(): Promise<Review[]> {
  const snapshot = await reviews().orderBy('createdAt', 'desc').limit(200).get();
  return snapshot.docs.map(mapReview);
}

export type ReviewInput = {
  name: string;
  city: string | null;
  body: string;
  invitationId: string | null;
};

export async function createReview(input: ReviewInput): Promise<Review> {
  const ref = await reviews().add({
    name: input.name.slice(0, REVIEW_MAX_NAME),
    city: input.city?.slice(0, 60) || null,
    body: input.body.slice(0, REVIEW_MAX_BODY),
    invitationId: input.invitationId,
    // Everything starts hidden. The operator decides what goes on the page.
    status: 'PENDING',
    createdAt: new Date(),
  });

  return mapReview(await ref.get());
}
