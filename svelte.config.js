import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Co-locate functions with the Neon database + object storage, which both
		// live in us-east-1 (iad1), to avoid cross-region round-trips.
		adapter: adapter({ regions: ['iad1'] }),
	},
}

export default config
