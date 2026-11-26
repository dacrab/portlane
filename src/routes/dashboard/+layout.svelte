<script lang="ts">
import MobileNav from '#lib/components/MobileNav.svelte'
import Sidebar from '#lib/components/Sidebar.svelte'
import Logo from '#lib/ui/Logo.svelte'

let { children, data } = $props()
</script>

<div class="flex h-dvh overflow-hidden">
	<div class="hidden lg:flex">
		<Sidebar user={data.user} unreadComments={data.unreadComments} />
	</div>

	<div class="flex min-w-0 flex-1 flex-col">
		<header class="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
			<Logo size="sm" href="/dashboard" />
			<span class="truncate text-xs text-muted">{data.user?.email}</span>
		</header>

		<main class="flex-1 overflow-y-auto">
			<div class="mx-auto max-w-6xl px-5 pb-28 pt-8 sm:px-8 lg:pb-12">
				{@render children()}
			</div>
		</main>
	</div>
</div>

<MobileNav unreadComments={data.unreadComments} />
