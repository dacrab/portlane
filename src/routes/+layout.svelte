<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';

	let { children, data } = $props();

	onMount(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
			if (session?.expires_at !== data.session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => subscription.unsubscribe();
	});
</script>

{@render children()}
<Toaster richColors position="bottom-right" />
