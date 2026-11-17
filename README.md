# StarPower Admin

Exclusive admin UI for the StarPower (astro) product. Visual language matches SayHey Admin (Outfit, brand blue `#465fff`).

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

`VITE_DASHBOARD_API` defaults to `https://paapi.sayhey.co.in/api/dashboard/api` (production gateway). Login always sends `product: "starpower"`.

## Hosts

Vite `allowedHosts`: `admin.starpower.app`, `starpower-admin.sayhey.co.in`, localhost.

Deploy/DNS for `admin.starpower.app` is out of scope for this repo.
