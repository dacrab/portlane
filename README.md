# Portlane

A client portal for freelancers and studios. Replace messy email threads and shared folders with a clean workspace your clients will actually use.

## What it does

**For you**
- Manage projects with milestones, due dates, and status tracking
- Track time, upload files, and write internal notes
- Create and send invoices, track payment status, and send automatic overdue reminders
- Invite clients by email — they receive a secure link to set a password and open their private portal

**For your clients**
- A private portal per project with the timeline, files, and invoices
- Approve work or request revisions
- Comment thread for back-and-forth

## Running locally

You'll need [Bun](https://bun.sh) and a [Neon](https://neon.tech) project (Postgres + Object Storage).

```bash
git clone https://github.com/dacrab/portlane
cd portlane
bun install
```

Set up environment variables via [Doppler](https://doppler.com) or directly in `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
# Neon Object Storage (S3-compatible) — `neonctl env pull` fills these in
AWS_ACCESS_KEY_ID=your-neon-storage-access-key
AWS_SECRET_ACCESS_KEY=your-neon-storage-secret-key
AWS_REGION=us-east-1
AWS_ENDPOINT_URL_S3=https://br-xxx.storage.us-east-1.aws.neon.tech
S3_BUCKET=portlane-files
BETTER_AUTH_SECRET=your-secret-at-least-32-chars
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-cron-secret
```

Generate and apply migrations, then start:

```bash
bun run db:generate
bun run db:migrate
bun dev
```

## How it works

- **Auth** — Better Auth with email & password (`hooks.server.ts` is the single handler; sessions are enriched with the user's role on every request).
- **Files** — uploads go to Neon Object Storage (S3-compatible, private bucket). Downloads go through `GET /api/file-url?path=…`, which authorizes the caller against the project (owner or linked client) and returns a presigned URL valid for 5 minutes.
- **Payments** — invoice checkout sessions are single-use, so clients can't double-pay via parallel tabs; the Stripe webhook flips status to `paid` after verifying the amount matches.
- **Reminders** — a daily cron moves past-due invoices to `overdue` and emails the client at most once a week (`lastReminderSentAt`).
- **Client invites & approvals** — inviting links an existing user or creates one, then emails a set-password link; approve/revision actions always re-check project membership server-side.
- **Account deletion** — deletes content authored/uploaded by the user and invoices where they were the client, then removes the user (their own projects cascade). Stored files are deleted best-effort; a weekly cleanup job removes anything left behind.
- **Observability** — Sentry captures server and browser errors (wired through `handleError`); it stays disabled unless `SENTRY_DSN`/`PUBLIC_SENTRY_DSN` are set, and builds upload source maps via `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN`.

## Deployment

The app runs on Vercel against a Neon project (Postgres + Object Storage).

1. **Environment** — set every variable from `.env.example` in the Vercel
   project. `PUBLIC_APP_URL` must be the public origin (`https://…`); the
   storage variables come from `neonctl env pull` on the production branch.
2. **Migrations** — apply schema changes to the production branch *after*
   deploying the matching code:
   ```bash
   doppler run --config prd_app -- bun run db:migrate
   ```
3. **Stripe webhook** — add an endpoint at
   `https://<your-domain>/api/stripe/webhook` for `checkout.session.completed`,
   and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. **Cron** — `vercel.json` schedules `/api/cron/storage-sweep` (weekly) and
   `/api/cron/invoice-reminders` (daily). Vercel sends
   `Authorization: Bearer $CRON_SECRET`, so `CRON_SECRET` must also be set in the
   Vercel project (Doppler alone is not enough).
5. **Email** — verify your sending domain in Resend and set `EMAIL_FROM`.
   Password resets, client invites, and payment reminders all send through
   Resend. Without `RESEND_API_KEY` the links are logged instead of sent, and
   Resend's `onboarding@resend.dev` sender can only reach the account owner.
6. **Sentry (optional)** — set `SENTRY_DSN` and `PUBLIC_SENTRY_DSN` to capture
   errors, plus `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` so builds create
   a release and upload source maps. With no DSN the SDK is disabled.

### Pre-launch checklist

- [ ] `PUBLIC_APP_URL` points at the production domain
- [ ] `BETTER_AUTH_SECRET` is a fresh 32+ character secret (not the dev value)
- [ ] Production-branch bucket exists and `AWS_*`/`S3_BUCKET` are set
- [ ] `bun run db:migrate` applied to the production branch
- [ ] Stripe webhook registered and `STRIPE_WEBHOOK_SECRET` set
- [ ] `CRON_SECRET` set in the Vercel project
- [ ] Resend sending domain verified (`EMAIL_FROM`, not `onboarding@resend.dev`)
- [ ] Sentry DSN set and a release with source maps uploaded
- [ ] `/api/health` responds `{"ok":true}` after deploy

## Tech stack

- **SvelteKit 3 (Svelte 5)** — full-stack framework with file-based routing
- **Better Auth** — authentication (email & password, session management)
- **Drizzle ORM** — typed database queries over PostgreSQL (Neon)
- **Stripe** — invoicing and payment processing
- **Neon Object Storage** — private file storage (S3-compatible) with presigned downloads
- **Sentry** — server + browser error monitoring with source-map uploads
- **Tailwind CSS v4** — utility-first styling
- **Biome** — linting and formatting · **Vitest** · **Knip**

## License

MIT
