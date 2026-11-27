/**
 * Backend origin the admin talks to. Production by default; staging builds set VITE_API_ORIGIN
 * (e.g. https://paapi-staging.sayhey.co.in) so a staging admin never touches production.
 */
export const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN ?? 'https://paapi.sayhey.co.in').replace(/\/$/, '');

/** Strips "<any host>/public/" from file URLs stored in the database (they carry the production host). */
export const PUBLIC_URL_PREFIX_RE = /^https?:\/\/[^/]+\/public\//;
