/**
 * Client-side scope checks — mirrors server hasScope() for UI gating.
 * Supports endpoint sub-scopes (wallet.wallets.list:read), wildcards
 * (astro.*:read, wallet.wallets.*:read), and legacy module scopes (wallet:read).
 */

export interface ParsedScope {
  endpoint: string;
  action: string;
}

export function parseScope(scope: string): ParsedScope | null {
  const idx = scope.lastIndexOf(':');
  if (idx <= 0) return null;
  const endpoint = scope.slice(0, idx);
  const action = scope.slice(idx + 1);
  if (!endpoint || !action) return null;
  return { endpoint, action };
}

/** True when `granted` covers `required` (same action). */
export function grantCovers(granted: string, required: string): boolean {
  if (granted === '*') return true;
  if (granted === required) return true;

  const g = parseScope(granted);
  const r = parseScope(required);
  if (!g || !r || g.action !== r.action) return false;

  if (g.endpoint.endsWith('.*')) {
    const prefix = g.endpoint.slice(0, -2);
    return r.endpoint === prefix || r.endpoint.startsWith(`${prefix}.`);
  }

  if (!g.endpoint.includes('.')) {
    return r.endpoint === g.endpoint || r.endpoint.startsWith(`${g.endpoint}.`);
  }

  return r.endpoint === g.endpoint || r.endpoint.startsWith(`${g.endpoint}.`);
}

export function can(requiredScope: string, grantedScopes: string[]): boolean {
  if (!grantedScopes.length) return false;
  if (grantedScopes.includes('*')) return true;

  for (const granted of grantedScopes) {
    if (grantCovers(granted, requiredScope)) return true;
  }

  const required = parseScope(requiredScope);
  if (required) {
    for (const granted of grantedScopes) {
      const g = parseScope(granted);
      if (
        g &&
        g.action === required.action &&
        (g.endpoint === required.endpoint ||
          g.endpoint.startsWith(`${required.endpoint}.`))
      ) {
        return true;
      }
    }
  }

  return false;
}

export function canAny(requiredScopes: string[], grantedScopes: string[]): boolean {
  return requiredScopes.some((s) => can(s, grantedScopes));
}

const ASTRO_PREFIXES = ['astro.', 'booking.'];

function isAstroEndpoint(endpoint: string): boolean {
  if (endpoint === 'astro' || endpoint.startsWith('astro.')) return true;
  return ASTRO_PREFIXES.some((p) => endpoint.startsWith(p));
}

function isAuthEndpoint(endpoint: string): boolean {
  return endpoint === 'auth' || endpoint.startsWith('auth.');
}

/** True when the account has at least one non-astro, non-auth-only scope. */
export function hasAnyCoreScope(scopes: string[]): boolean {
  if (scopes.includes('*')) return true;
  return scopes.some((s) => {
    const ep = parseScope(s)?.endpoint;
    if (!ep || isAuthEndpoint(ep)) return false;
    if (isAstroEndpoint(ep)) return false;
    return true;
  });
}

/** True when the account has any astro vertical scope. */
export function hasAstroScope(scopes: string[]): boolean {
  if (scopes.includes('*')) return true;
  return scopes.some((s) => {
    const ep = parseScope(s)?.endpoint;
    return ep ? isAstroEndpoint(ep) : false;
  });
}

export function isAdminRole(roleId?: string | null): boolean {
  return roleId === 'admin';
}

/** Collect all assignable scope strings from a module catalog entry. */
export function moduleScopeStrings(mod: {
  id: string;
  scopes?: string[];
  endpoints?: { scopes: string[] }[];
}): string[] {
  if (mod.endpoints?.length) {
    return [...new Set(mod.endpoints.flatMap((e) => e.scopes))];
  }
  return mod.scopes ?? [`${mod.id}:read`, `${mod.id}:write`];
}
