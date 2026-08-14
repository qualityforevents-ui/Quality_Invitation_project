import { prisma } from './db';
import { REVIEW_MAX_BODY, REVIEW_MAX_NAME } from './constants';
import type { Review } from '@/generated/prisma/client';

export { REVIEW_MAX_BODY, REVIEW_MAX_NAME } from './constants';

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
    return await prisma.review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('[reviews] could not load approved reviews', error);
    return [];
  }
}

export async function getPendingReviews(): Promise<Review[]> {
  return prisma.review.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getAllReviews(): Promise<Review[]> {
  return prisma.review.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
}

export type ReviewInput = {
  name: string;
  city: string | null;
  body: string;
  invitationId: string | null;
};

export async function createReview(input: ReviewInput): Promise<Review> {
  return prisma.review.create({
    data: {
      name: input.name.slice(0, REVIEW_MAX_NAME),
      city: input.city?.slice(0, 60) || null,
      body: input.body.slice(0, REVIEW_MAX_BODY),
      invitationId: input.invitationId,
      // Everything starts hidden. The operator decides what goes on the page.
      status: 'PENDING',
    },
  });
}
