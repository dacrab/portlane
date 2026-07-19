<script lang="ts">
import '../app.css'
import { Toaster } from 'svelte-sonner'

let { children } = $props()
</script>

<svelte:head>
	<script>
		try {
			const t = localStorage.getItem('theme');
			if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
				document.documentElement.classList.add('dark');
			}
		} catch {}
	</script>
</svelte:head>

{@render children()}
<Toaster richColors position="bottom-right" />
