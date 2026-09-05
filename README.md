# Portlane

A client portal for freelancers and studios. Replace messy email threads and shared folders with a clean workspace your clients will actually use.

## What it does

**For you**
- Manage projects with milestones, due dates, and status tracking
- Track time, upload files, and write internal notes
- Create and send invoices, track payment status
- Invite clients by email — a client account is created and linked to the project (no emails are sent; share the portal link or their sign-in email)

**For your clients**
- A private portal per project with the timeline, files, and invoices
- Approve work or request revisions
- Comment thread for back-and-forth

## Running locally

You'll need [Bun](https://bun.sh) and a [Neon](https://neon.tech) database.

```bash
git clone https://github.com/dacrab/portlane
cd portlane
bun install
```

Set up environment variables via [Doppler](https://doppler.com) or directly in `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
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
- **Files** — uploads go to Vercel Blob with `access: 'private'`. Downloads go through `GET /api/file-url?path=…`, which authorizes the caller against the project (owner or linked client) and returns a presigned URL valid for 5 minutes.
- **Payments** — invoice checkout sessions are single-use, so clients can't double-pay via parallel tabs; the Stripe webhook flips status to `paid` after verifying the amount matches.
- **Client invites & approvals** — inviting links an existing user by email or creates one; approve/revision actions always re-check project membership server-side.
- **Account deletion** — deletes content authored/uploaded by the user and invoices where they were the client, then removes the user (their own projects cascade). Stored files are deleted best-effort; a weekly cleanup job removes anything left behind.

## Tech stack

- **SvelteKit 2 (Svelte 5)** — full-stack framework with file-based routing
- **Better Auth** — authentication (email & password, session management)
- **Drizzle ORM** — typed database queries over PostgreSQL (Neon)
- **Stripe** — invoicing and payment processing
- **Vercel Blob** — private file storage with presigned downloads
- **Tailwind CSS v4** — utility-first styling
- **Biome** — linting and formatting · **Vitest** · **Knip**

## License

MIT
