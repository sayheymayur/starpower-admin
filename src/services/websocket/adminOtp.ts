export type OtpLogStatus = 'sent' | 'verified' | 'failed' | 'expired';
export type OtpLogPurpose = 'login' | 'aadhar';

export interface AdminOtpLog {
  id: number;
  phone: string;
  otp: string;
  purpose: OtpLogPurpose;
  isListener: boolean | null;
  newUser: boolean | null;
  status: OtpLogStatus;
  expiresAt: string;
  createdAt: string;
  verifiedAt: string | null;
  ipAddress: string | null;
}

export interface AdminOtpListResponse {
  otps: AdminOtpLog[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    totalPages: number;
  };
}

export type DashboardWsEvent =
  | { type: 'otps'; data: AdminOtpListResponse }
  | { type: 'otplog'; data: AdminOtpLog }
  | { type: 'error'; message: string }
  | { type: 'connected'; userId: string }
  | { type: 'unknown'; raw: string };

const DEFAULT_GATEWAY_WS =
  import.meta.env.VITE_GATEWAY_WS_URL ?? 'wss://paapi.sayhey.co.in';

export function getDashboardWsBaseUrl(): string {
  return DEFAULT_GATEWAY_WS.replace(/\/$/, '');
}

export function connectAdminOtpSocket(token: string): WebSocket {
  const base = getDashboardWsBaseUrl();
  return new WebSocket(
    `${base}/ws/dashboard?token=${encodeURIComponent(token)}`
  );
}

export function parseDashboardMessage(raw: string): DashboardWsEvent | null {
  if (!raw.startsWith('|')) return null;

  const parts = raw.split('|');
  const service = parts[1];
  const event = parts[2];
  const payload = parts.slice(3).join('|');

  if (service === 'gateway' && event === 'connected') {
    return {
      type: 'connected',
      userId: payload.replace('Welcome ', '').trim(),
    };
  }

  if (service !== 'dashboard') return { type: 'unknown', raw };

  if (event === 'error') {
    return { type: 'error', message: payload };
  }

  if (event === 'otps') {
    return { type: 'otps', data: JSON.parse(payload) as AdminOtpListResponse };
  }

  if (event === 'otplog') {
    return { type: 'otplog', data: JSON.parse(payload) as AdminOtpLog };
  }

  return { type: 'unknown', raw };
}

export function sendDashboardCommand(
  ws: WebSocket,
  command: string,
  args: (string | number)[] = []
): void {
  if (ws.readyState !== WebSocket.OPEN) return;

  const argString = args.length ? ` ${args.join(', ')}` : '';
  ws.send(`>dashboard\n${command}${argString}`);
}

export function upsertOtpRow(
  rows: AdminOtpLog[],
  row: AdminOtpLog
): AdminOtpLog[] {
  const idx = rows.findIndex((r) => r.id === row.id);
  if (idx === -1) return [row, ...rows];
  const next = [...rows];
  next[idx] = row;
  return next;
}
