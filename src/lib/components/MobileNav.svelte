<script lang="ts">
	import { page } from '$app/state';
	import { navItems } from '$lib/nav';

	let { unreadComments = 0 }: { unreadComments?: number } = $props();
</script>

<nav class="fixed bottom-0 inset-x-0 z-30 flex lg:hidden"
	style="background:var(--color-sidebar-bg);border-top:1px solid rgba(255,255,255,0.08);padding-bottom:env(safe-area-inset-bottom)">
	{#each navItems as item}
		{@const active = page.url.pathname === item.href || (item.href !== '/dashboard' && page.url.pathname.startsWith(item.href))}
		<a href={item.href} class="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors"
			style="color:{active ? '#fff' : 'var(--color-zinc-500)'}">
			{#if active}<item.B class="h-5 w-5" />{:else}<item.R class="h-5 w-5" />{/if}
			{item.labelShort}
			{#if item.href === '/dashboard' && unreadComments > 0}
				<span class="absolute top-2 right-[calc(50%-18px)] h-2 w-2 rounded-full" style="background:var(--color-accent-600)"></span>
			{/if}
		</a>
	{/each}
</nav>
