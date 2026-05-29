# Flipbook — marketing site

The pre-launch waitlist landing page for [useflipbook.com](https://www.useflipbook.com).
Next.js 16 (App Router, Turbopack), Tailwind v4, Framer Motion.

## Develop

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local dev posts signups to the **dev** Convex deployment via
`NEXT_PUBLIC_CONVEX_SITE_URL` in `.env.local`. Production uses the prod
deployment, set in the host's environment.

## How it fits together

- **Backend:** signups POST to the Convex HTTP endpoint (`/waitlist`) in the
  repo-root `convex/` package — no shared code, just the public endpoint. A
  welcome email is sent via Resend on each new signup.
- **Fonts:** Raleway (sans/UI/brand) + Instrument Serif (display). No Inter.
- **Theme:** three modes (Light / Flip / Dark), `data-theme` on `<html>`; Flip
  (indigo) is the SSR default.
- **Icons:** Flipbook coral mark — `app/favicon.ico`, `app/icon.svg`,
  `app/apple-icon.png`.

## Deploy

Hosted on Vercel, Git-connected (root directory = `web/`). Set
`NEXT_PUBLIC_CONVEX_SITE_URL` to the production Convex `.convex.site` URL.
