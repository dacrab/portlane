<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	let { children, data } = $props();
</script>

<div class="flex h-screen overflow-hidden">
	<Sidebar user={data.user} />
	<main class="flex-1 overflow-y-auto transition-all duration-200" style="background:var(--color-bg)">
		<div class="mx-auto max-w-5xl px-10 py-10">
			{@render children()}
		</div>
	</main>
</div>
