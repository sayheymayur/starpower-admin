import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import Badge from '../components/ui/badge';
import { ApiError } from '../services/api/base';
import {
  CallRecording,
  RECORDING_STATUS_LABELS,
  callRecordingsAPI,
  formatRecordingDuration,
  recordingStatusColor,
} from '../services/api/callRecordings';

export default function CallRecordingDetail() {
  const { recordingId } = useParams<{ recordingId: string }>();
  const [recording, setRecording] = useState<CallRecording | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Loading recording…</p>
      </div>
    );
  }

  if (!recording) {
    return (
      <div className="space-y-4">
        <Link to="/call-recordings" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          ← Back to call recordings
        </Link>
        <p className="text-red-600">{error ?? 'Recording not found'}</p>
      </div>
    );
  }

  const canPlay = recording.status === 'completed' && Boolean(recording.recordingUrl);
  const duration = formatRecordingDuration(recording.startedAt, recording.stoppedAt);

  return (
    <div className="space-y-6">
      <Link to="/call-recordings" className="inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
        ← Back to call recordings
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Recording #{recording.recordingId}
              </h1>
              <Badge size="sm" color={recordingStatusColor(recording.status)}>
                {RECORDING_STATUS_LABELS[recording.status]}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-sm text-gray-500">{recording.channelName}</p>
            <p className="mt-1 text-sm text-gray-500">Duration {duration}</p>
          </div>
          {recording.sessionId && (
            <Link
              to={`/session-details?sessionId=${recording.sessionId}`}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              View session
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Playback</h2>
            {canPlay && recording.recordingUrl ? (
              <RecordingPlayer url={recording.recordingUrl} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-600 dark:bg-gray-900/50">
                <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
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
            role="Caller"
            name={recording.user?.fullName}
            username={recording.user?.username}
            phone={recording.user?.phone}
            userId={recording.user?.userId}
            profileLink={recording.user?.userId ? `/enhanced-user-details?userId=${recording.user.userId}` : undefined}
          />
          <ParticipantCard
            role="Listener"
            name={recording.listener?.fullName}
            username={recording.listener?.username}
            phone={recording.listener?.phone}
            userId={recording.listener?.userId}
            profileLink={recording.listener?.userId ? `/enhanced-user-details?userId=${recording.listener.userId}` : undefined}
          />

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
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
  const isMp4 = /\.mp4(\?|$)/i.test(url);

  return (
    <div className="space-y-3">
      {(isMp4 || !isHls) && (
        <video controls className="w-full rounded-lg bg-black" src={url} preload="metadata">
          Your browser does not support audio playback.
        </video>
      )}
      {isHls && (
        <>
          <video controls className="w-full rounded-lg bg-black" src={url} preload="metadata">
            Your browser does not support HLS playback.
          </video>
          <p className="text-xs text-gray-500">
            HLS streams (`.m3u8`) play natively in Safari. On other browsers,{' '}
            <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              open the stream in a new tab
            </a>{' '}
            or use an HLS-capable player.
          </p>
        </>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        Open recording URL →
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
  name?: string;
  username?: string | null;
  phone?: string | null;
  userId?: number;
  profileLink?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{role}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{name ?? '—'}</p>
      {username && <p className="text-sm text-gray-500">@{username}</p>}
      {phone && <p className="mt-1 font-mono text-sm text-gray-600 dark:text-gray-400">{phone}</p>}
      {userId && <p className="text-xs text-gray-400">User ID {userId}</p>}
      {profileLink && (
        <Link to={profileLink} className="mt-2 inline-flex text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          View profile →
        </Link>
      )}
    </div>
  );
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-gray-100 py-2 last:border-0 dark:border-gray-800">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`text-right font-medium text-gray-900 dark:text-white ${mono ? 'max-w-[60%] truncate font-mono text-xs' : ''}`} title={value}>
        {value}
      </dd>
    </div>
  );
}

function formatTs(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}
