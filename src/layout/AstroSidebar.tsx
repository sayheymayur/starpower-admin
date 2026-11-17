import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { can, canAny } from '../utils/scopes';
import { isProductRoot } from '../utils/authRoles';

type NavItem = {
  name: string;
  path: string;
  exact?: boolean;
  /** Any of these scopes grants visibility; omit = always for authenticated users */
  scopes?: string[];
  adminOnly?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: 'Operations',
    items: [
      { name: 'Overview', path: '/astro', scopes: ['astro.analytics.overview:read', 'astro.*:read'] },
      { name: 'Users', path: '/astro/users', scopes: ['astro.users:read', 'astro.*:read'] },
      { name: 'Astrologers', path: '/astro/astrologers', exact: true, scopes: ['astro.astrologers:read', 'astro.*:read'] },
      {
        name: 'Pending verification',
        path: '/astro/astrologers?filter=pending',
        exact: true,
        scopes: ['astro.astrologers:read', 'astro.*:read'],
      },
      { name: 'Bookings', path: '/astro/bookings', scopes: ['astro.bookings:read', 'booking.*:read', 'astro.*:read'] },
      { name: 'Coupons', path: '/astro/coupons', scopes: ['booking.coupons:read', 'astro.*:read'] },
    ],
  },
  {
    label: 'Instant',
    items: [
      {
        name: 'Instant sessions',
        path: '/astro/instant-sessions',
        scopes: ['astro.instant-sessions:read', 'astro.*:read'],
      },
      {
        name: 'Call recordings',
        path: '/astro/call-recordings',
        scopes: ['astro.call-recordings:read', 'astro.*:read'],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Payments', path: '/astro/transactions', scopes: ['astro.transactions:read', 'astro.*:read'] },
      { name: 'Payouts', path: '/astro/payouts', scopes: ['astro.payouts:read', 'astro.*:read'] },
      { name: 'Invoices', path: '/astro/invoices', scopes: ['astro.invoices:read', 'astro.*:read'] },
      { name: 'Bank accounts', path: '/astro/banks', scopes: ['astro.banks:read', 'astro.*:read'] },
    ],
  },
  {
    label: 'Wallet',
    items: [
      {
        name: 'Wallets',
        path: '/astro/wallets',
        scopes: ['wallet.astro.wallets:read', 'wallet.astro.*:read', 'astro.*:read'],
      },
      {
        name: 'Wallet transactions',
        path: '/astro/wallet-transactions',
        scopes: ['wallet.astro.transactions:read', 'wallet.astro.*:read', 'astro.*:read'],
      },
    ],
  },
  {
    label: 'Feedback',
    items: [
      { name: 'Reviews', path: '/astro/ratings', scopes: ['astro.ratings:read', 'astro.*:read'] },
      { name: 'Notifications', path: '/astro/notifications', scopes: ['astro.notifications:read', 'astro.*:read'] },
      { name: 'Support tickets', path: '/astro/support', scopes: ['astro.support:read', 'astro.*:read'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'Accounts', path: '/admins', adminOnly: true, scopes: ['auth.admins:read', 'auth.*:read'] },
      { name: 'Roles', path: '/roles', adminOnly: true, scopes: ['auth.roles:read', 'auth.*:read'] },
    ],
  },
];

const AstroSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout, scopes, isAdmin } = useAuth();
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
  const root = isProductRoot(user) || isAdmin || scopes.includes('*');

  const showLabels = isExpanded || isHovered || isMobileOpen;

  const isActive = (item: NavItem) => {
    if (item.path === '/astro') return location.pathname === '/astro';
    if (item.exact) {
      const [pathname, search] = item.path.split('?');
      if (location.pathname !== pathname) return false;
      if (!search) return !location.search || location.search === '';
      return location.search === `?${search}` || location.search.includes(search);
    }
    return location.pathname.startsWith(item.path);
  };

  const canSee = (item: NavItem) => {
    if (item.adminOnly && !isAdmin && !root) return false;
    if (root || scopes.includes('*')) return true;
    if (!item.scopes?.length) return true;
    return canAny(item.scopes, scopes) || item.scopes.some((s) => can(s, scopes));
  };

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(canSee),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 z-50 h-screen border-r border-gray-200 bg-white text-gray-800 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200
        ${isExpanded || isMobileOpen ? 'w-[260px]' : isHovered ? 'w-[260px]' : 'w-[72px]'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`px-4 py-6 ${showLabels ? '' : 'lg:px-2'}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-theme-xs">
            ✦
          </div>
          {showLabels && (
            <div>
              <p className="font-bold text-gray-900 dark:text-white">StarPower</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-4">
        {visibleSections.map((section) => (
          <div key={section.label}>
            {showLabels && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item)
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs opacity-80">
                    {item.name.charAt(0)}
                  </span>
                  {showLabels && <span>{item.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4 space-y-2 dark:border-gray-800">
        {showLabels && user && (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs dark:bg-white/5">
            <p className="font-medium text-gray-900 truncate dark:text-white">{user.fullName}</p>
            <p className="text-gray-500 truncate dark:text-gray-400">{user.roleId ?? user.role}</p>
          </div>
        )}
        <Link
          to="/settings/password"
          className={`block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 ${showLabels ? '' : 'text-center'}`}
        >
          {showLabels ? 'Change password' : '🔑'}
        </Link>
        <button
          onClick={logout}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 ${showLabels ? '' : 'text-center'}`}
        >
          {showLabels ? 'Sign out' : '⎋'}
        </button>
      </div>
    </aside>
  );
};

export default AstroSidebar;
