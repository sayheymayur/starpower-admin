import { Link } from 'react-router';
import { AstrologerSummary } from '../../../services/api/astro';
import AstrologerVerificationActions from './AstrologerVerificationActions';
import {
  AstroAvatar,
  DocIcons,
  KycBadge,
  VerificationBadge,
  TestAstrologerBadge,
  astroCard,
} from './astroUi';

export default function PendingVerificationCard({
  astrologer,
  onUpdated,
}: {
  astrologer: AstrologerSummary;
  onUpdated: (status: number) => void;
}) {
  const docs = astrologer.documents;

  return (
    <div
      className={`${astroCard} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <AstroAvatar name={astrologer.fullName} photo={astrologer.profilePhoto} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/astro/astrologers/${astrologer.userId}`}
              className="truncate font-semibold text-gray-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-400"
            >
              {astrologer.fullName}
            </Link>
            <VerificationBadge status={astrologer.doctorProfileStatus} />
            <TestAstrologerBadge
              isTest={astrologer.isTestAstrologer}
              viewerCount={astrologer.testViewerUserIds?.length}
            />
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{astrologer.mobileNo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{astrologer.yearsOfExperience ?? '—'} yrs exp</span>
            <span>Call ₹{astrologer.callRate ?? '—'}/min</span>
            <span>Chat ₹{astrologer.chatRate ?? '—'}/min</span>
            {docs?.panNo && <span className="font-mono">PAN {docs.panNo}</span>}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DocIcons documents={docs} variant="astrologer" />
            <KycBadge status={docs?.kycStatus ?? null} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-brand-50 pt-3 sm:border-t-0 sm:pt-0 dark:border-brand-900/20">
        <AstrologerVerificationActions
          userId={astrologer.userId}
          fullName={astrologer.fullName}
          doctorProfileStatus={astrologer.doctorProfileStatus}
          compact
          onUpdated={onUpdated}
        />
        <Link
          to={`/astro/astrologers/${astrologer.userId}`}
          className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 hover:underline dark:text-brand-400 dark:hover:bg-brand-950/30"
        >
          Review
        </Link>
      </div>
    </div>
  );
}
