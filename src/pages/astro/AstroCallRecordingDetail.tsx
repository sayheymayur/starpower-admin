import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Badge from '../../components/ui/badge';
import { ApiError } from '../../services/api/base';
import {
  CallRecording,
  RECORDING_STATUS_LABELS,
  callRecordingsAPI,
  downloadRecordingMp3,
  formatRecordingDuration,
  recordingStatusColor,
} from '../../services/api/callRecordings';
import {
  AstroAlert,
  AstroBackLink,
  AstroLoading,
  AstroPageHeader,
  astroBtn,
  astroCard,
} from './components/astroUi';

export default function AstroCallRecordingDetail() {
  const { recordingId } = useParams<{ recordingId: string }>();
  const [recording, setRecording] = useState<CallRecording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!recordingId) return;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await callRecordingsAPI.getById(Number(recordingId));
        setRecording(data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load recording');
      } finally {
        setLoading(false);
      }
    })();
  }, [recordingId]);

  if (loading) return <AstroLoading label="Loading recording…" />;

  if (!recording) {
    return (
      <div className="space-y-4">
        <AstroBackLink to="/astro/call-recordings">Back to call recordings</AstroBackLink>
        <AstroAlert type="error" message={error ?? 'Recording not found'} />
      </div>
    );
  }

  const canPlay = recording.status === 'completed' && Boolean(recording.recordingUrl);
  const canDownload = Boolean(recording.recordingUrl);
  const duration = formatRecordingDuration(recording.startedAt, recording.stoppedAt);
  const partner = recording.astrologer ?? recording.listener;

  const onDownloadMp3 = async () => {
    try {
      setDownloading(true);
      setDownloadError(null);
      await downloadRecordingMp3(recording.recordingId);
    } catch (e) {
      setDownloadError(e instanceof ApiError ? e.message : 'Failed to download MP3');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AstroBackLink to="/astro/call-recordings">Back to call recordings</AstroBackLink>
      <AstroPageHeader
        title={`Recording #${recording.recordingId}`}
        description={recording.channelName}
        action={
          <div className="flex flex-wrap gap-2">
            {canDownload && (
              <button type="button" disabled={downloading} onClick={() => void onDownloadMp3()} className={astroBtn}>
                {downloading ? 'Converting to MP3…' : 'Download MP3'}
              </button>
            )}
            {recording.bookingId != null && (
              <Link
                to={`/astro/bookings/${recording.bookingId}`}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                View booking
              </Link>
            )}
          </div>
        }
      />

      <div className={`${astroCard} p-5`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" color={recordingStatusColor(recording.status)}>
            {RECORDING_STATUS_LABELS[recording.status]}
          </Badge>
          <span className="text-sm text-gray-500">Duration {duration}</span>
          {recording.bookingId != null && (
            <span className="text-sm text-gray-500">Booking #{recording.bookingId}</span>
          )}
          {recording.kind === 'instant' && (
            <span className="text-sm text-gray-500">Instant call</span>
          )}
        </div>
      </div>

      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {downloadError && (
        <AstroAlert type="error" message={downloadError} onDismiss={() => setDownloadError(null)} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className={`${astroCard} p-5`}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Playback</h2>
            {canPlay && recording.recordingUrl ? (
              <RecordingPlayer url={recording.recordingUrl} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-900/50">
                <p className="font-medium text-gray-700 dark:text-gray-300">No recording available</p>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  {recording.status === 'stopped'
                    ? 'Call ended before audio was captured or the Agora worker was already gone.'
                    : recording.status === 'failed'
                      ? 'Recording failed to start or upload.'
                      : recording.status === 'recording'
                        ? 'This call is still being recorded.'
                        : 'No playback URL was stored for this recording.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <ParticipantCard
            role="User"
            name={recording.user?.fullName}
            username={recording.user?.username}
            phone={recording.user?.phone}
            userId={recording.user?.userId}
            profileLink={recording.user?.userId ? `/astro/users/${recording.user.userId}` : undefined}
          />
          <ParticipantCard
            role="Astrologer"
            name={partner?.fullName}
            username={partner?.username}
            phone={partner?.phone}
            userId={partner?.userId}
            profileLink={partner?.userId ? `/astro/astrologers/${partner.userId}` : undefined}
          />

          <div className={`${astroCard} p-5`}>
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Technical details</h3>
            <dl className="space-y-2 text-sm">
              <MetaRow label="Session PK" value={String(recording.sessionId)} mono />
              {recording.session?.sessionUuid && (
                <MetaRow label="Session UUID" value={recording.session.sessionUuid} mono />
              )}
              {recording.session?.sessionType != null && (
                <MetaRow label="Session type" value={recording.session.sessionType === 1 ? 'Call' : 'Chat'} />
              )}
              <MetaRow label="Started" value={formatTs(recording.startedAt)} />
              <MetaRow label="Stopped" value={formatTs(recording.stoppedAt)} />
              <MetaRow label="Created" value={formatTs(recording.createdAt)} />
              {recording.recordingSid && <MetaRow label="Recording SID" value={recording.recordingSid} mono />}
              {recording.recordingUid && <MetaRow label="Recording UID" value={recording.recordingUid} mono />}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecordingPlayer({ url }: { url: string }) {
  const isHls = /\.m3u8(\?|$)/i.test(url);

  return (
    <div className="space-y-3">
      <video controls className="w-full rounded-lg bg-black" src={url} preload="metadata">
        Your browser does not support audio playback.
      </video>
      {isHls && (
        <p className="text-xs text-gray-500">
          HLS streams (`.m3u8`) play natively in Safari. On other browsers,{' '}
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            open the stream URL
          </a>
          .
        </p>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
      >
        Open recording URL
      </a>
    </div>
  );
}

function ParticipantCard({
  role,
  name,
  username,
  phone,
  userId,
  profileLink,
}: {
  role: string;
  name?: string | null;
  username?: string | null;
  phone?: string | null;
  userId?: number;
  profileLink?: string;
}) {
  return (
    <div className={`${astroCard} p-5`}>
      <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">{role}</h3>
      <dl className="space-y-2 text-sm">
        <MetaRow label="Name" value={name ?? '—'} />
        <MetaRow label="Username" value={username ?? '—'} />
        <MetaRow label="Phone" value={phone ?? '—'} mono />
        <MetaRow label="User ID" value={userId != null ? String(userId) : '—'} mono />
      </dl>
      {profileLink && (
        <Link to={profileLink} className="mt-3 inline-flex text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          View profile →
        </Link>
      )}
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className={`text-right text-gray-900 dark:text-gray-100 ${mono ? 'font-mono text-xs break-all' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function formatTs(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
