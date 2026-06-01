<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	let { children, data } = $props();
</script>

<div class="flex h-screen overflow-hidden">
	<Sidebar user={data.user} />
	<main class="flex-1 overflow-y-auto" style="background:var(--color-bg)">
		<div class="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
			{@render children()}
		</div>
	</main>
</div>
