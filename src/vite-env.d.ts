/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full dashboard API base, e.g. https://paapi.sayhey.co.in/api/dashboard/api */
  readonly VITE_DASHBOARD_API?: string;
  /** Backend origin, e.g. https://paapi-staging.sayhey.co.in (default: production) */
  readonly VITE_API_ORIGIN?: string;
  /** WebSocket gateway host, e.g. wss://paapi.sayhey.co.in or ws://localhost:5000 */
  readonly VITE_GATEWAY_WS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
