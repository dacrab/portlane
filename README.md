# Portlane

A client portal for freelancers and studios — projects, files, invoices, and payments in one clean workspace.

## Features

- Projects with milestones, due dates, and status tracking
- File sharing, time tracking, and internal notes
- Invoices with Stripe checkout and automatic overdue reminders
- A private client portal with approvals, revisions, and comments

## Running locally

Requires [Bun](https://bun.sh) and a [Neon](https://neon.tech) project (Postgres + Object Storage).

```bash
bun install
bun run db:migrate
bun dev
```

Configuration is read from the environment — see `.env.example` for the full list. The `dev`, `build`, and `check` scripts run through `doppler run`, so either link a Doppler project (`doppler setup`) or invoke Vite directly (`bunx vite dev`).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `AWS_*`, `S3_BUCKET` | Neon Object Storage (S3-compatible) |
| `BETTER_AUTH_SECRET` | Session signing secret (32+ characters) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments |
| `RESEND_API_KEY`, `EMAIL_FROM` | Transactional email |
| `PUBLIC_APP_URL` | Public origin |
| `CRON_SECRET` | Authenticates Vercel Cron requests |
| `SENTRY_*`, `PUBLIC_SENTRY_DSN` | Error monitoring (optional) |

## Deployment

Runs on Vercel against Neon. Set the variables above in the Vercel project, then apply migrations to the production branch after deploying the matching code:

```bash
doppler run --config prd_app -- bun run db:migrate
```

`vercel.json` schedules two crons — a weekly storage sweep and a daily invoice-reminder job — both authenticated with `CRON_SECRET`. The Stripe webhook lives at `/api/stripe/webhook`.

## Scripts

```bash
bun dev          # dev server
bun run build    # production build
bun run check    # type checks
bun run test     # unit tests
bun run knip     # unused code and dependencies
bun run lint     # Biome
bun run db:generate   # new migration from schema changes
bun run db:migrate    # apply migrations
```

## Tech stack

SvelteKit 3 (Svelte 5) · Better Auth · Drizzle ORM · Neon (Postgres + Object Storage) · Stripe · Resend · Sentry · Tailwind CSS v4 · Biome · Vitest

## License

MIT
