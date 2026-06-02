<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let { children, data } = $props();

	onMount(() => {
		// Dark mode init
		const saved = localStorage.getItem('theme');
		if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			document.documentElement.classList.add('dark');
		}

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
			if (session?.expires_at !== data.sessionExpiresAt) {
				invalidate('supabase:auth');
			}
		});
		return () => subscription.unsubscribe();
	});
</script>

<!-- Prevent dark mode flash -->
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
