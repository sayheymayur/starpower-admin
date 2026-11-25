import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { AstroSessionFeedback, AstroSessionFeedbackItem } from '../../../services/api/astro';
import { astroFinanceAPI, type AstroRating } from '../../../services/api/astroFinance';
import { AstroSectionCard, formatAstroDate } from './astroUi';

/** ★★★★☆ with the numeric value; compact for table cells. */
export function StarRating({ value, compact = false }: { value: number; compact?: boolean }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap" title={`${value} out of 5`}>
      <span className={`${compact ? 'text-sm' : 'text-base'} leading-none text-amber-500`} aria-hidden>
        {'★'.repeat(full)}
        <span className="text-gray-300 dark:text-gray-600">{'★'.repeat(5 - full)}</span>
      </span>
      <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 dark:text-gray-300`}>
        {value}
      </span>
    </span>
  );
}

/** Table cell: the customer's rating of the astrologer for this session, or a dash. */
export function FeedbackStarsCell({ feedback }: { feedback?: AstroSessionFeedback | null }) {
  const rating = feedback?.userToAstrologer?.rating;
  return rating != null ? <StarRating value={rating} compact /> : <span className="text-gray-400">—</span>;
}

function FeedbackBlock({
  title,
  item,
  emptyLabel,
}: {
  title: string;
  item: AstroSessionFeedbackItem | null;
  emptyLabel: string;
}) {
  return (
    <div className="border-b border-gray-100 py-3 first:pt-0 last:border-0 last:pb-0 dark:border-gray-800">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
      {item ? (
        <div className="mt-1.5 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StarRating value={item.rating} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatAstroDate(item.createdAt)}</span>
          </div>
          {item.comment && (
            <p className="whitespace-pre-line text-sm text-gray-800 dark:text-gray-200">“{item.comment}”</p>
          )}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {item.astrologerReply && (
            <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-gray-800 dark:bg-brand-950/30 dark:text-gray-200">
              <span className="font-medium">Astrologer reply: </span>
              {item.astrologerReply}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-1 text-sm text-gray-400">{emptyLabel}</p>
      )}
    </div>
  );
}

/** Both directions of feedback for one booking or instant session. */
export function SessionFeedbackCard({ feedback }: { feedback?: AstroSessionFeedback | null }) {
  return (
    <AstroSectionCard title="Feedback" description="Ratings given after this session">
      <FeedbackBlock
        title="Customer → astrologer"
        item={feedback?.userToAstrologer ?? null}
        emptyLabel="The customer has not rated this session."
      />
      <FeedbackBlock
        title="Astrologer → customer"
        item={feedback?.astrologerToUser ?? null}
        emptyLabel="The astrologer has not left feedback."
      />
    </AstroSectionCard>
  );
}

function RecentReview({ review, who }: { review: AstroRating; who: string }) {
  return (
    <li className="border-b border-gray-100 py-2.5 last:border-0 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{who}</span>
        <StarRating value={review.rating} compact />
      </div>
      {review.comment && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">“{review.comment}”</p>
      )}
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{formatAstroDate(review.createdAt)}</p>
    </li>
  );
}

/** Astrologer detail: average, count, star distribution and the latest reviews. */
export function AstrologerRatingsCard({ astrologerUserId }: { astrologerUserId: number }) {
  const [data, setData] = useState<AstrologerRatingsSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    astroFinanceAPI
      .getAstrologerRatings(astrologerUserId, { page: 1, limit: 3 })
      .then((res) => !cancelled && setData(res.data))
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [astrologerUserId]);

  const total = data?.totalReviews ?? 0;
  return (
    <AstroSectionCard
      title="Ratings"
      description="From StarPower customers"
      action={
        <Link to={`/astro/ratings?astrologerUserId=${astrologerUserId}`} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
          All ratings →
        </Link>
      }
    >
      {failed ? (
        <p className="text-sm text-gray-400">Could not load ratings.</p>
      ) : !data ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : total === 0 ? (
        <p className="text-sm text-gray-400">No ratings yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.averageRating.toFixed(1)}</span>
            <div>
              <StarRating value={Math.round(data.averageRating)} compact />
              <p className="text-xs text-gray-500 dark:text-gray-400">{total} rating{total === 1 ? '' : 's'}</p>
            </div>
          </div>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = Number(data.ratingDistribution[String(star)] ?? 0);
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <span className="w-6 text-right">{star}★</span>
                  <div className="h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                  <span className="w-6">{count}</span>
                </div>
              );
            })}
          </div>
          {data.reviews.length > 0 && (
            <ul>
              {data.reviews.map((r) => (
                <RecentReview key={r.ratingId} review={r} who={r.byUser?.name || `User #${r.byUser?.userId}`} />
              ))}
            </ul>
          )}
        </div>
      )}
    </AstroSectionCard>
  );
}

/** Customer detail: ratings they gave astrologers and feedback astrologers gave them. */
export function UserRatingsCard({ userId }: { userId: number }) {
  const [data, setData] = useState<AstroUserRatingsSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    astroFinanceAPI
      .getUserRatings(userId)
      .then((res) => !cancelled && setData(res.data))
      .catch(() => !cancelled && setFailed(true));
    return () => { cancelled = true; };
  }, [userId]);

  const given = data?.ratingsGiven ?? [];
  const received = data?.ratingsReceived ?? [];
  const avg = (list: AstroRating[]) =>
    list.length ? (list.reduce((s, r) => s + Number(r.rating), 0) / list.length).toFixed(1) : null;

  return (
    <AstroSectionCard title="Ratings" description="StarPower sessions only">
      {failed ? (
        <p className="text-sm text-gray-400">No StarPower ratings for this user.</p>
      ) : !data ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Given to astrologers</p>
              <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                {data.givenCount ?? given.length}{avg(given) && <span className="ml-1 font-normal text-gray-500">· avg {avg(given)}★</span>}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">Feedback from astrologers</p>
              <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                {data.receivedCount ?? received.length}{avg(received) && <span className="ml-1 font-normal text-gray-500">· avg {avg(received)}★</span>}
              </p>
            </div>
          </div>
          {given.length > 0 && (
            <ul>
              {given.slice(0, 3).map((r) => (
                <RecentReview key={r.ratingId} review={r} who={`To ${r.toUser?.name || `astrologer #${r.toUser?.userId}`}`} />
              ))}
            </ul>
          )}
        </div>
      )}
    </AstroSectionCard>
  );
}

type AstrologerRatingsSummary = {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
  reviews: AstroRating[];
};

type AstroUserRatingsSummary = {
  givenCount?: number;
  receivedCount?: number;
  ratingsGiven: AstroRating[];
  ratingsReceived: AstroRating[];
};
