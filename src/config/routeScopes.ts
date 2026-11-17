/**
 * Maps dashboard paths to required read scopes.
 * Longest prefix wins when resolving via getScopeForPath().
 */

const EXACT_SCOPES: Record<string, string> = {
  '/analytics-dashboard': 'analytics:read',
  '/analytics': 'analytics:read',
  '/realtime': 'monitoring:read',
  '/login-otps': 'otp.monitor.getotps:read',
  '/activity-tracking': 'activity:read',
  '/aadhaar': 'aadhaar:read',
  '/app-logs': 'app-logs:read',
  '/enhanced-users': 'users:read',
  '/enhanced-user-details': 'users:read',
  '/users': 'users:read',
  '/userdetails': 'users:read',
  '/bulk-user-update': 'users:write',
  '/listeners': 'listeners:read',
  '/listener-approval-status': 'listeners:read',
  '/listener-banks': 'payouts:read',
  '/listener-payout-summary': 'payouts:read',
  '/doctor-management': 'doctors:read',
  '/doctor-status-management': 'doctors:read',
  '/sessionhistory': 'sessions:read',
  '/session-details': 'sessions:read',
  '/session-reports': 'sessions:read',
  '/call-recordings': 'call.recordings:read',
  '/wallet-overview': 'wallet:read',
  '/wallet-management': 'wallet:read',
  '/wallet-transactions': 'wallet:read',
  '/account-transactions': 'wallet:read',
  '/razorpay-transactions': 'wallet:read',
  '/razorpay-test-users': 'razorpay.test:read',
  '/update-wallet': 'wallet:write',
  '/all-invoices': 'invoices:read',
  '/invoice-details': 'invoices:read',
  '/invoice-statistics': 'invoices.stats:read',
  '/posts-management': 'posts:read',
  '/post-details': 'posts:read',
  '/post-statistics': 'posts:read',
  '/post-reports': 'posts:read',
  '/all-ratings': 'ratings:read',
  '/rating-statistics': 'ratings:read',
  '/all-notifications': 'notifications:read',
  '/send-notifications': 'notifications:write',
  '/notification-statistics': 'notifications:read',
  '/support-tickets': 'support:read',
  '/app-configuration': 'app.config:read',
  '/booking-coupons': 'booking.coupons:read',
  '/api-dashboard': 'monitoring:read',
  '/services-status': 'monitoring:read',
  '/processes': 'monitoring:read',
  '/monitoring': 'monitoring:read',
  '/tasks': 'todos:read',
  '/settings/password': 'auth:read',
  '/chat-history': 'chats:read',
  '/ivr-calls': 'ivr:read',
};

const PREFIX_SCOPES: { prefix: string; scope: string }[] = [
  { prefix: '/listener-banks/', scope: 'payouts:read' },
  { prefix: '/user-rating-summary/', scope: 'ratings:read' },
  { prefix: '/support-tickets/', scope: 'support:read' },
  { prefix: '/call-recordings/', scope: 'call.recordings:read' },
  { prefix: '/aadhaar/', scope: 'aadhaar:read' },
  { prefix: '/app-logs/', scope: 'app-logs:read' },
  { prefix: '/processes/', scope: 'monitoring:read' },
  { prefix: '/astro', scope: 'astro.analytics:read' },
];

/** Admin-only paths — checked via isAdminRole(), not scopes. */
export const ADMIN_ONLY_PATHS = [
  '/admins',
  '/roles',
];

/** Landing-page candidates in priority order (first match wins). */
export const HOME_ROUTE_PRIORITY: { path: string; scope: string }[] = [
  { path: '/analytics-dashboard', scope: 'analytics:read' },
  { path: '/astro', scope: 'astro.analytics:read' },
  { path: '/support-tickets', scope: 'support:read' },
  { path: '/enhanced-users', scope: 'users:read' },
  { path: '/users', scope: 'users:read' },
  { path: '/realtime', scope: 'monitoring:read' },
  { path: '/login-otps', scope: 'otp.monitor.getotps:read' },
  { path: '/activity-tracking', scope: 'activity:read' },
  { path: '/aadhaar', scope: 'aadhaar:read' },
  { path: '/sessionhistory', scope: 'sessions:read' },
  { path: '/call-recordings', scope: 'call.recordings:read' },
  { path: '/wallet-overview', scope: 'wallet:read' },
  { path: '/posts-management', scope: 'posts:read' },
  { path: '/all-ratings', scope: 'ratings:read' },
  { path: '/all-notifications', scope: 'notifications:read' },
  { path: '/services-status', scope: 'monitoring:read' },
  { path: '/tasks', scope: 'todos:read' },
  { path: '/settings/password', scope: 'auth:read' },
];

export function getScopeForPath(pathname: string): string | null {
  if (ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  if (EXACT_SCOPES[pathname]) return EXACT_SCOPES[pathname];

  for (const { prefix, scope } of PREFIX_SCOPES) {
    if (pathname === prefix || pathname.startsWith(prefix)) return scope;
  }

  return null;
}
