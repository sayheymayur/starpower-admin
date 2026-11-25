import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ApiError } from '../../services/api/base';
import {
  astroAPI,
  type AstroInstantSession,
  type SetAstrologerFeeBody,
} from '../../services/api/astro';
import AstrologerFeeCard, { FreeFeeBadge } from './components/AstrologerFeeCard';
import { SessionFeedbackCard } from './components/SessionFeedbackCard';
import {
  AstroAlert,
  AstroBackLink,
  AstroInfoRow,
  AstroLoading,
  AstroPageHeader,
  AstroSectionCard,
  InstantSessionStatusBadge,
  formatAstroDate,
  formatCallDuration,
  formatINR,
} from './components/astroUi';

export default function InstantSessionDetail() {
  const { sessionId = '' } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<AstroInstantSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    void (async () => {
      try {
        setLoading(true);
        const res = await astroAPI.getInstantSession(sessionId);
        setData(res.data);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const handleFeeChange = async (body: SetAstrologerFeeBody) => {
    if (!sessionId) return;
    await astroAPI.setInstantSessionAstrologerFee(sessionId, body);
    const res = await astroAPI.getInstantSession(sessionId);
    setData(res.data);
  };

  if (loading) return <AstroLoading label="Loading instant session…" />;

  return (
    <div className="space-y-6">
      <AstroBackLink to="/astro/instant-sessions">Back to instant sessions</AstroBackLink>
      <AstroPageHeader
        title="Instant session"
        description={data?.sessionId ?? sessionId}
      />
      {error && <AstroAlert type="error" message={error} onDismiss={() => setError(null)} />}
      {data && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AstroSectionCard title="Session">
            <AstroInfoRow label="Session ID" value={data.sessionId} mono />
            <AstroInfoRow label="Txn ID" value={data.txnId} />
            <AstroInfoRow label="Type" value={data.sessionTypeLabel ?? data.sessionType} />
            <AstroInfoRow label="Status" value={<InstantSessionStatusBadge status={data.status} />} />
            <AstroInfoRow label="Duration" value={formatCallDuration(data.durationSeconds)} />
            <AstroInfoRow label="Billed minutes" value={data.billedMinutes} />
            <AstroInfoRow label="Amount" value={formatINR(data.amount)} />
            <AstroInfoRow
              label="Earning"
              value={
                data.isFree ? (
                  <span className="inline-flex items-center gap-2">
                    <FreeFeeBadge source={data.freeSource ?? 'admin'} /> {formatINR(0)}
                  </span>
                ) : (
                  formatINR(data.earning)
                )
              }
            />
          </AstroSectionCard>
          <AstroSectionCard title="Parties & timing">
            <AstroInfoRow label="User" value={data.userName ? `${data.userName} (#${data.userId})` : data.userId} />
            <AstroInfoRow label="Mobile" value={data.userMobile} />
            <AstroInfoRow
              label="Astrologer"
              value={data.astrologerName ? `${data.astrologerName} (#${data.astrologerId})` : data.astrologerId}
            />
            <AstroInfoRow label="Requested" value={formatAstroDate(data.requestDateTime)} />
            <AstroInfoRow label="Started" value={formatAstroDate(data.startDateTime)} />
            <AstroInfoRow label="Ended" value={formatAstroDate(data.endDateTime)} />
            <AstroInfoRow label="Remark" value={data.remark} />
          </AstroSectionCard>
          <SessionFeedbackCard feedback={data.feedback} />
          <AstrologerFeeCard
            fee={data.astrologerFee}
            subject="this instant session"
            onChange={handleFeeChange}
          />
        </div>
      )}
    </div>
  );
}
