# Portlane

A client portal for freelancers and studios — projects, time tracking, and invoices in one place.

**Live demo:** https://portlane.vercel.app

Portlane gives you one clean workspace for client work. Keep projects and milestones up to date, log your hours, and send invoices that clients can pay online. Clients sign in to a private portal to follow progress, download files, and leave comments.

## Features

- Projects with milestones, due dates, and status at a glance
- A private client portal for files, comments, and approvals
- Time tracking with a quick export
- Invoices with online card checkout through Stripe
- Automatic reminders for overdue invoices
- A dashboard that sums up revenue, invoices, and clients

## Run it locally

You'll need [Bun](https://bun.sh), a Postgres database (the project uses [Neon](https://neon.tech)), and an S3-compatible bucket for files.

```bash
bun install
cp .env.example .env
bun run db:migrate
bunx vite dev
```

Fill in `.env` with your database URL, auth secret, storage keys, and Stripe keys. Email and Sentry keys are optional.

The usual scripts run through Doppler; if you don't use it, `bunx vite dev` and `bunx vite build` work directly.

## Good to know

- Uploaded files go to object storage; the database only keeps their details.
- Stripe stays in test mode until you add live keys.
- Reminder emails need a Resend key, but invoices still work without one.
- Clients get their own login at `/portal` — separate from your dashboard.

## Built with

SvelteKit, Tailwind CSS, Better Auth, Drizzle, and Neon. Hosted on Vercel.

## License

MIT
