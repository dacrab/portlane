# Portlane

A clean, modern client portal for freelancers and studios. Replace messy email threads and Drive folders with a professional workspace your clients will actually love.

Built with SvelteKit 5, Supabase, and Tailwind CSS.

![SvelteKit](https://img.shields.io/badge/SvelteKit-5-FF3E00?style=flat&logo=svelte&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## Features

**Freelancer dashboard**
- Project management with milestones, status tracking, and due date alerts
- Time tracking per project with running totals
- File uploads via Supabase Storage with signed download URLs
- Invoice creation and status management (draft → sent → paid)
- Client invitation via magic link email
- Internal notes per project (not visible to clients)
- Activity feed showing recent client comments
- Collapsible sidebar with persistent state

**Client portal**
- Clean, branded portal view per project
- Timeline/milestone progress
- File downloads
- Approve work or request revisions
- Comment thread

**Auth**
- Email/password signup and login
- Magic link client invitations
- Password reset flow
- Auth callback handler for invite links

## Tech stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit 5 (Svelte 5 runes) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Styling | Tailwind CSS v4 |
| Icons | Phosphor Icons |
| Toasts | svelte-sonner |
| Runtime | Bun |

## Getting started

**1. Clone and install**
```bash
git clone https://github.com/dacrab/portlane
cd portlane
bun install
```

**2. Set up Supabase**
```bash
supabase start
```

Copy the keys from `supabase status` into `.env`:
```env
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

**3. Run migrations and seed**
```bash
supabase db reset
bunx tsx seed.ts
```

**4. Start dev server**
```bash
bun dev
```

## Seed accounts

After running `bunx tsx seed.ts`:

| Role | Email | Password |
|---|---|---|
| Freelancer | alex@portlane.dev | password123 |
| Client | sarah@acmecorp.com | password123 |
| Client | james@startupxyz.com | password123 |

## Project structure

```
src/
├── lib/
│   ├── components/Sidebar.svelte
│   ├── stores.ts          # sidebar collapsed state
│   ├── supabase.ts        # browser client
│   └── database.types.ts  # generated Supabase types
├── routes/
│   ├── (auth)/            # login, signup, forgot/reset password
│   ├── auth/callback/     # magic link handler
│   ├── dashboard/         # freelancer dashboard
│   │   ├── projects/
│   │   ├── invoices/
│   │   ├── clients/
│   │   └── settings/
│   ├── portal/            # client-facing portal
│   └── api/file-url/      # signed storage URLs
└── hooks.server.ts        # SSR Supabase client + session
```

## License

MIT
