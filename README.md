# Portlane

A client portal for freelancers and studios. Replace messy email threads and shared folders with a clean workspace your clients will actually use.

## What it does

**For you**
- Manage projects with milestones, due dates, and status tracking
- Track time, upload files, and write internal notes
- Create and send invoices, track payment status
- Invite clients via email — no account setup needed on their end

**For your clients**
- A private portal per project with the timeline, files, and invoices
- Approve work or request revisions
- Comment thread for back-and-forth

## Running locally

You'll need [Bun](https://bun.sh), a [Neon](https://neon.tech) database, and a [Clerk](https://clerk.com) application.

```bash
git clone https://github.com/dacrab/portlane
cd portlane
bun install
```

Set up environment variables via [Doppler](https://doppler.com) or directly in `.env`:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
PUBLIC_APP_URL=http://localhost:5173
```

Generate and apply migrations, then start:

```bash
bun run db:generate
bun run db:migrate
bun dev
```

## Tech stack

- **SvelteKit 5** — full-stack framework with file-based routing
- **Clerk** — authentication (session management, sign-in/sign-up pages)
- **Drizzle ORM** — typed database queries over PostgreSQL (Neon)
- **Stripe** — invoicing and payment processing
- **Tailwind CSS v4** — utility-first styling
- **Biome** — linting and formatting

## License

MIT
