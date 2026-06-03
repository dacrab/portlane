# Portlane

A client portal for freelancers and studios. Replace messy email threads and shared folders with a clean workspace your clients will actually use.

## What it does

**For you**
- Manage projects with milestones, due dates, and status tracking
- Track time, upload files, and write internal notes
- Create and send invoices, track payment status
- Invite clients via magic link — no account setup needed on their end

**For your clients**
- A private portal per project with the timeline, files, and invoices
- Approve work or request revisions
- Comment thread for back-and-forth

## Running locally

You'll need [Bun](https://bun.sh) and [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
git clone https://github.com/dacrab/portlane
cd portlane
bun install
supabase start
```

Copy the keys from `supabase status` into `.env`:

```env
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

Then run migrations, seed, and start:

```bash
supabase db reset
bun dev
```

**Test accounts**

| Role | Email | Password |
|---|---|---|
| Freelancer | alex@portlane.dev | password123 |
| Client | sarah@acmecorp.com | password123 |

## License

MIT
