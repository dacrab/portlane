import { sentrySvelteKit } from '@sentry/sveltekit/vite'
import adapter from '@sveltejs/adapter-vercel'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		// Must run before the SvelteKit plugin. Reads SENTRY_ORG / SENTRY_PROJECT
		// / SENTRY_AUTH_TOKEN at build time to create a release and upload source
		// maps; without them it warns and skips, leaving runtime error capture
		// intact.
		sentrySvelteKit({ autoUploadSourceMaps: true }),
		sveltekit({
			preprocess: vitePreprocess(),
			// Co-locate functions with the Neon database + object storage, which
			// both live in us-east-1 (iad1), to avoid cross-region round-trips.
			adapter: adapter({ regions: ['iad1'] }),
		}),
	],
	server: { port: 3000 },
})
