<script lang="ts">
import { navItems } from '#lib/nav.js'
import { page } from '$app/state'

let { unreadComments = 0 }: { unreadComments?: number } = $props()
</script>

<nav class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
	<ul class="flex">
		{#each navItems as item (item.href)}
			{@const active = page.url.pathname === item.href || (item.href !== '/dashboard' && page.url.pathname.startsWith(item.href))}
			<li class="flex-1">
				<a
					href={item.href}
					class="relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors {active ? 'text-accent' : 'text-muted'}"
				>
					{#if active}
						<item.B class="h-5 w-5" />
					{:else}
						<item.R class="h-5 w-5" />
					{/if}
					{item.label}
					{#if item.href === '/dashboard' && unreadComments > 0}
						<span class="absolute right-[calc(50%-16px)] top-1.5 h-1.5 w-1.5 rounded-full bg-accent"></span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</nav>
