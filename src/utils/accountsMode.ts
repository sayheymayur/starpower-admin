import { useEffect, useState } from 'react';

/**
 * Real vs test accounts. Test accounts (internal staff, Razorpay test users, test astrologers)
 * are excluded from every admin list and stat; the "Test accounts" sidebar section switches the
 * admin into test mode, which adds `accounts=test` to every admin API request.
 */
export type AccountsMode = 'real' | 'test';

const KEY = 'admin.accountsMode';
const EVENT = 'admin:accounts-mode';

export function getAccountsMode(): AccountsMode {
  try {
    return localStorage.getItem(KEY) === 'test' ? 'test' : 'real';
  } catch {
    return 'real';
  }
}

export function setAccountsMode(mode: AccountsMode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable: mode lasts for this page only */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useAccountsMode(): AccountsMode {
  const [mode, setMode] = useState<AccountsMode>(getAccountsMode);
  useEffect(() => {
    const update = () => setMode(getAccountsMode());
    window.addEventListener(EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return mode;
}

/** In test mode, add `accounts=test` to every request sent to the admin API. */
export function installAccountsModeFetch(apiBaseUrl: string) {
  const original = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (getAccountsMode() === 'test') {
      const raw = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (raw.startsWith(apiBaseUrl)) {
        const url = new URL(raw);
        url.searchParams.set('accounts', 'test');
        input = input instanceof Request ? new Request(url.toString(), input) : url.toString();
      }
    }
    return original(input, init);
  };
}
