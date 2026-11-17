import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import { astroFinanceAPI, AstroRating } from '../../services/api/astroFinance';
import Badge from '../../components/ui/badge';
import {
  AstroAlert,
  AstroPageHeader,
  astroBtnOutline,
  astroCard,
  BookingStatusPill,
  formatAstroDate,
} from './components/astroUi';

export default function AstroRatingDetail() {
  const { ratingId } = useParams<{ ratingId: string }>();
  const [rating, setRating] = useState<AstroRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ratingId) return;
    void (async () => {
      try {
        setLoading(true);
        const res = await astroFinanceAPI.getRating(Number(ratingId));
        setRating(res.data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load rating');
      } finally {
        setLoading(false);
      }
    })();
  }, [ratingId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="space-y-4">
        {error && <AstroAlert type="error" message={error} />}
        <Link to="/astro/ratings" className={astroBtnOutline}>← Back to reviews</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AstroPageHeader
        title={`Review #${rating.ratingId}`}
        description={`${rating.rating} stars · ${formatAstroDate(rating.createdAt)}`}
        action={<Link to="/astro/ratings" className={astroBtnOutline}>← All reviews</Link>}
      />

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`${astroCard} p-5 space-y-4`}>
          <h3 className="font-semibold text-gray-900 dark:text-white">Review</h3>
          <p className="text-2xl text-amber-500">{'★'.repeat(rating.rating)}{'☆'.repeat(5 - rating.rating)}</p>
          {rating.comment && <p className="text-gray-700 dark:text-gray-300">{rating.comment}</p>}
          {rating.tags && rating.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {rating.tags.map((tag) => (
                <Badge key={tag} color="primary" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
          {rating.astrologerReply && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm dark:border-brand-900/40 dark:bg-brand-950/30">
              <p className="text-xs font-medium text-brand-700 dark:text-brand-400 mb-1">Astrologer reply</p>
              {rating.astrologerReply}
            </div>
          )}
          {rating.sessionId && (
            <p className="text-sm text-gray-500">
              Session: <span className="font-mono">{rating.sessionId}</span>
              {rating.sessionType && ` (${rating.sessionType})`}
            </p>
          )}
        </div>

        <div className={`${astroCard} p-5 space-y-4`}>
          <h3 className="font-semibold text-gray-900 dark:text-white">Parties</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500">By</p>
              <p className="font-medium">{rating.byUser.name}</p>
              {rating.byUser.mobileNo && <p className="text-gray-400">{rating.byUser.mobileNo}</p>}
              {rating.byUser.isAstrologer && (
                <Link to={`/astro/astrologers/${rating.byUser.userId}`} className="text-brand-600 hover:underline dark:text-brand-400 text-xs">
                  View astrologer
                </Link>
              )}
              {rating.byUser.isAstroUser && !rating.byUser.isAstrologer && (
                <Link to={`/astro/users/${rating.byUser.userId}`} className="text-brand-600 hover:underline dark:text-brand-400 text-xs">
                  View user
                </Link>
              )}
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-medium">{rating.toUser.name}</p>
              {rating.toUser.mobileNo && <p className="text-gray-400">{rating.toUser.mobileNo}</p>}
              {rating.toUser.isAstrologer && (
                <Link to={`/astro/astrologers/${rating.toUser.userId}`} className="text-brand-600 hover:underline dark:text-brand-400 text-xs">
                  View astrologer
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {rating.linkedBooking && (
        <div className={`${astroCard} p-5`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Linked booking</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-gray-500">Booking</dt>
              <dd>
                <Link to={`/astro/bookings/${rating.linkedBooking.bookingId}`} className="text-brand-600 hover:underline dark:text-brand-400">
                  #{rating.linkedBooking.bookingId}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd><BookingStatusPill status={rating.linkedBooking.status} /></dd>
            </div>
            <div>
              <dt className="text-gray-500">Start</dt>
              <dd>{formatAstroDate(rating.linkedBooking.startDateTime)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">End</dt>
              <dd>{formatAstroDate(rating.linkedBooking.endDateTime)}</dd>
            </div>
          </dl>
        </div>
      )}

      {rating.rawComments && (
        <div className={`${astroCard} p-5`}>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Raw comment</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{rating.rawComments}</pre>
        </div>
      )}
    </div>
  );
}
