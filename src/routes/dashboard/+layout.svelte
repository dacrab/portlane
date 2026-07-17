<script lang="ts">
import MobileNav from '$lib/components/MobileNav.svelte'
import Sidebar from '$lib/components/Sidebar.svelte'

let { children, data } = $props()
</script>

<div class="flex h-screen overflow-hidden">
	<div class="hidden lg:flex">
		<Sidebar user={data.user} unreadComments={data.unreadComments} />
	</div>

	<main class="flex-1 overflow-y-auto" style="background:var(--color-bg)">
		<div class="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-8 lg:pb-8">
			<div class="space-y-8">
				{@render children()}
			</div>
		</div>
	</main>
</div>


<MobileNav unreadComments={data.unreadComments} />
