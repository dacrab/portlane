# Portlane

Portlane is a calm home for freelance client work: projects, hours, and invoices in one place.

**Live demo:** https://portlane.vercel.app

Freelancers and small studios use it to keep clients up to date without a pile of spreadsheets and email threads. Clients get their own login, where they can follow progress, grab files, comment, and approve work.

## On your side

- Projects with milestones, due dates, and a clear status
- Time entries that add up per project and export in a click
- Invoices with Stripe checkout and polite overdue reminders
- A client list, plus a dashboard with revenue and invoice totals

## On their side

The `/portal` view is separate from your dashboard. Clients sign in to see their projects, download deliverables, leave comments, and approve finished work. They can also pay an invoice right there.

## Getting set up

Bun, a Postgres database, and an S3-compatible bucket are required. Postgres and storage are set up for [Neon](https://neon.tech), auth uses [Better Auth](https://www.better-auth.com), and Stripe handles payments.

```bash
bun install
cp .env.example .env
bun run db:migrate
bunx vite dev
```

Fill in `.env` before the migration: database URL, auth secret, storage keys, and Stripe keys. In development, Resend and Sentry are optional and auth links are printed to the console instead of sent.

The default `dev` and `build` scripts expect Doppler. Without it, use `bunx vite dev` and `bunx vite build`.

## Production

- Apply migrations with `bun run db:migrate`. `db:push` is for local prototyping only.
- Set `PUBLIC_APP_URL` at build time; SvelteKit inlines it. It must be the canonical `https://` origin.
- `BETTER_AUTH_SECRET` must be at least 32 characters. Generate one with `openssl rand -base64 32`.
- Email is required in production: set `RESEND_API_KEY` and an `EMAIL_FROM` on a verified domain. Startup fails otherwise, because sign-up and client invites depend on verification and password-setup emails.
- Set `CRON_SECRET` so Vercel's cron requests can authenticate. Vercel sends it automatically as `Authorization: Bearer $CRON_SECRET`.
- `SENTRY_DSN` and `PUBLIC_SENTRY_DSN` are optional, but recommended.

The first request fails fast if required configuration is missing, and `/api/health` reports database connectivity for uptime checks.

## License

MIT
