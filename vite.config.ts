import { sentrySvelteKit } from '@sentry/sveltekit/vite'
import adapter from '@sveltejs/adapter-vercel'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		sentrySvelteKit({ autoUploadSourceMaps: Boolean(process.env.VERCEL) }),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({ regions: ['iad1'] }),
		}),
	],
	server: { port: 3000 },
})
