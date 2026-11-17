import { TOKEN_KEY, UNAUTHORIZED_EVENT, authService } from '../auth/dashboardAuth';
import { API_CONFIG } from './config';
import { ApiError } from './base';

export interface AstroWalletUser {
  user_id_pk: number;
  full_name: string | null;
  email_id: string | null;
  mobile_no: string;
  is_doctor?: number;
}

export interface AstroWallet {
  wallet_id_pk: number;
  user_id_fk: number;
  amount: number;
  last_updated_date_time: string;
  created_date_time: string;
  created_by?: number;
  user?: AstroWalletUser;
}

export interface AstroWalletStats {
  totalWallets?: number;
  totalBalance?: number;
  averageBalance?: number;
  maxBalance?: number;
  minBalance?: number;
  [key: string]: unknown;
}

export interface AstroWalletTransaction {
  transaction_id_pk?: number;
  transaction_id?: string | number;
  user_id_fk?: number;
  user_id?: number;
  amount: number;
  order_id?: string | null;
  payment_id?: string | null;
  payment_date_time?: string | null;
  credited_to_wallet?: boolean;
  gst_amount?: number;
  payment_status?: number;
  is_credit?: boolean;
  remark?: string | null;
  created_date_time?: string;
  transaction_type?: string;
  status?: string;
  user?: AstroWalletUser;
  [key: string]: unknown;
}

export interface AstroAccountTransaction {
  account_transaction_id_pk?: number;
  user_id_fk?: number;
  amount: number;
  transaction_type?: string;
  remark?: string | null;
  created_date_time?: string;
  user?: AstroWalletUser;
  [key: string]: unknown;
}

type ListParams = Record<string, string | number | boolean | undefined>;

function buildQuery(params?: ListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

async function walletRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const url = `${API_CONFIG.BASE_URL}/astro/wallet${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));

  if (res.status === 401) {
    authService.handleUnauthorized();
    window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    throw new ApiError('Session expired. Please log in again.', 401, body);
  }

  if (!res.ok || body.success === false) {
    throw new ApiError(body.message ?? `HTTP ${res.status}`, res.status, body);
  }

  return body as T;
}

export const astroWalletAPI = {
  listWallets: (params?: ListParams) =>
    walletRequest<{
      success: boolean;
      data: AstroWallet[];
      pagination?: { page: number; limit: number; total: number; totalPages: number };
    }>(`/wallets${buildQuery(params)}`),

  getWalletByUser: (userId: number) =>
    walletRequest<{ success: boolean; data: AstroWallet }>(`/wallets/user/${userId}`),

  getBalance: (userId: number) =>
    walletRequest<{ success: boolean; data: { balance: number; userId?: number } }>(
      `/wallets/user/${userId}/balance`
    ),

  getStats: () =>
    walletRequest<{ success: boolean; data: AstroWalletStats }>('/wallets/stats'),

  listTransactions: (params?: ListParams) =>
    walletRequest<{
      success: boolean;
      data: AstroWalletTransaction[];
      pagination?: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions${buildQuery(params)}`),

  listUserTransactions: (userId: number, params?: ListParams) =>
    walletRequest<{
      success: boolean;
      data: AstroWalletTransaction[];
      pagination?: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/user/${userId}${buildQuery(params)}`),

  listAccountTransactions: (params?: ListParams) =>
    walletRequest<{
      success: boolean;
      data: AstroAccountTransaction[];
      pagination?: { page: number; limit: number; total: number; totalPages: number };
    }>(`/account/transactions${buildQuery(params)}`),

  listUserAccountTransactions: (userId: number, params?: ListParams) =>
    walletRequest<{
      success: boolean;
      data: AstroAccountTransaction[];
      pagination?: { page: number; limit: number; total: number; totalPages: number };
    }>(`/account/transactions/user/${userId}${buildQuery(params)}`),

  add: (userId: number, amount: number, remark?: string) =>
    walletRequest<{ success: boolean; data: AstroWallet; message?: string }>(
      `/wallets/user/${userId}/add`,
      { method: 'POST', body: JSON.stringify({ amount, remark }) }
    ),

  deduct: (userId: number, amount: number, remark?: string) =>
    walletRequest<{ success: boolean; data: AstroWallet; message?: string }>(
      `/wallets/user/${userId}/deduct`,
      { method: 'POST', body: JSON.stringify({ amount, remark }) }
    ),

  reset: (userId: number, remark?: string) =>
    walletRequest<{ success: boolean; data: AstroWallet; message?: string }>(
      `/wallets/user/${userId}/reset`,
      { method: 'POST', body: JSON.stringify({ remark }) }
    ),

  updateBalance: (userId: number, amount: number, remark?: string) =>
    walletRequest<{ success: boolean; data: AstroWallet; message?: string }>(
      `/wallets/user/${userId}/update-balance`,
      { method: 'POST', body: JSON.stringify({ amount, remark }) }
    ),
};
