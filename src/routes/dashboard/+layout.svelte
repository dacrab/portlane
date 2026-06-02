<script lang="ts">
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MobileNav from '$lib/components/MobileNav.svelte';
	let { children, data } = $props();
</script>

<div class="flex h-screen overflow-hidden">
	<!-- Sidebar: hidden on mobile, visible on lg+ -->
	<div class="hidden lg:flex">
		<Sidebar user={data.user} unreadComments={data.unreadComments} />
	</div>

	<main class="flex-1 overflow-y-auto" style="background:var(--color-bg)">
		<div class="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-10 lg:py-10 lg:pb-10">
			{@render children()}
		</div>
	</main>
</div>

<!-- Bottom nav on mobile -->
<MobileNav unreadComments={data.unreadComments} />
