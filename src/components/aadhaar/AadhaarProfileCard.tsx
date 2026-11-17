import { Link } from 'react-router';
import Badge from '../ui/badge';
import { formatLocalDate } from '../../utils/dateUtils';
import {
  AdminAadhaarProfile,
  aadhaarStatusColor,
  formatAadhaarGender,
  partnerTypeLabel,
  AADHAAR_STATUS_LABELS,
} from '../../services/api/aadhaar';

interface AadhaarProfileCardProps {
  aadhaar: AdminAadhaarProfile | null | undefined;
  userId?: number;
  compact?: boolean;
  showViewLink?: boolean;
}

export default function AadhaarProfileCard({
  aadhaar,
  userId,
  compact = false,
  showViewLink = true,
}: AadhaarProfileCardProps) {
  const id = userId ?? aadhaar?.userId;

  if (!aadhaar) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-sm text-gray-600 dark:text-gray-400">Not verified via DigiLocker</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white">DigiLocker Aadhaar</h3>
            <Badge color={aadhaarStatusColor(aadhaar.verificationStatus)} size="sm">
              {AADHAAR_STATUS_LABELS[aadhaar.verificationStatus]}
            </Badge>
          </div>
          {showViewLink && id && (
            <Link
              to={`/aadhaar/${id}`}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Full details
            </Link>
          )}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Name</dt>
            <dd className="text-gray-900 dark:text-gray-100">{aadhaar.fullName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Masked Aadhaar</dt>
            <dd className="font-mono text-gray-900 dark:text-gray-100">{aadhaar.maskedAadhaar ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Verified</dt>
            <dd className="text-gray-900 dark:text-gray-100">
              {aadhaar.verifiedAt ? formatLocalDate(aadhaar.verifiedAt) : '—'}
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-700">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">DigiLocker Aadhaar</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Surepass verification record</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={aadhaarStatusColor(aadhaar.verificationStatus)} size="sm">
            {AADHAAR_STATUS_LABELS[aadhaar.verificationStatus]}
          </Badge>
          {showViewLink && id && (
            <Link
              to={`/aadhaar/${id}`}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Open record
            </Link>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {aadhaar.profileImageUrl && (
            <img
              src={aadhaar.profileImageUrl}
              alt="Aadhaar profile"
              className="h-24 w-20 rounded-lg border border-gray-200 object-cover dark:border-gray-600"
            />
          )}
          <dl className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Full name" value={aadhaar.fullName} />
            <Field label="Masked Aadhaar" value={aadhaar.maskedAadhaar} mono />
            <Field label="Partner type" value={partnerTypeLabel(aadhaar)} />
            <Field label="DOB" value={aadhaar.dob ? formatLocalDate(aadhaar.dob) : aadhaar.yob} />
            <Field label="Gender" value={formatAadhaarGender(aadhaar.gender)} />
            <Field label="Mobile" value={aadhaar.mobileNo ?? aadhaar.digilockerMobile} />
            <Field label="Care of" value={aadhaar.careOf ?? aadhaar.fatherName} className="sm:col-span-2" />
            <Field label="Address" value={aadhaar.fullAddress} className="sm:col-span-2 lg:col-span-3" />
            <Field label="PIN" value={aadhaar.zipCode} />
            <Field label="Verified at" value={aadhaar.verifiedAt ? formatLocalDate(aadhaar.verifiedAt) : null} />
            <Field label="DigiLocker ID" value={aadhaar.digilockerClientId} mono />
          </dl>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {aadhaar.profileImageUrl && (
            <a
              href={aadhaar.profileImageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Aadhaar photo
            </a>
          )}
          {aadhaar.xmlUrl && (
            <a
              href={aadhaar.xmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Download XML
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  className = '',
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={`mt-0.5 text-sm text-gray-900 dark:text-gray-100 ${mono ? 'font-mono text-xs' : ''}`}>
        {value?.trim() ? value : '—'}
      </dd>
    </div>
  );
}
