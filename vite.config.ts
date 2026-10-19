import adapter from '@sveltejs/adapter-vercel'
import { sveltekit } from '@sveltejs/kit/vite'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			// Co-locate functions with the Neon database + object storage, which
			// both live in us-east-1 (iad1), to avoid cross-region round-trips.
			adapter: adapter({ regions: ['iad1'] }),
		}),
	],
	server: { port: 3000 },
})
