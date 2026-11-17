import type { DashboardRole } from '../services/auth/types';
import { hasAstroScope } from './scopes';

export type RoleUser = {
  role: DashboardRole;
  roleId?: DashboardRole;
  product?: string;
  isRoot?: boolean;
};

export function getAccessibleHomeRoute(
  _scopes: string[] = [],
  _user?: RoleUser | null
): string {
  return '/astro';
}

export function getDefaultRoute(
  _user: RoleUser,
  _scopes: string[] = []
): string {
  return '/astro';
}

export function canEnterFullDashboardShell(_scopes: string[]): boolean {
  return false;
}

export function canAccessFullDashboard(_scopes: string[]): boolean {
  return false;
}

export function canAccessAstro(scopes: string[]): boolean {
  if (scopes.includes('*')) return true;
  if (hasAstroScope(scopes)) return true;
  // Product roots may receive default scope hints without every wildcard expanded
  return scopes.some((s) => s.startsWith('astro.') || s.startsWith('auth.') || s.startsWith('booking.') || s.startsWith('wallet.astro.'));
}

export function isProductRoot(user?: RoleUser | null): boolean {
  const roleId = user?.roleId ?? user?.role;
  return roleId === 'astroadmin' || Boolean(user?.isRoot);
}
