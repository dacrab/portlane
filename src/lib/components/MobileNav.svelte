<script lang="ts">
	import { page } from '$app/state';
	import IconSquaresFourRegular from 'phosphor-icons-svelte/IconSquaresFourRegular.svelte';
	import IconSquaresFourBold from 'phosphor-icons-svelte/IconSquaresFourBold.svelte';
	import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte';
	import IconFolderOpenBold from 'phosphor-icons-svelte/IconFolderOpenBold.svelte';
	import IconFileTextRegular from 'phosphor-icons-svelte/IconFileTextRegular.svelte';
	import IconFileTextBold from 'phosphor-icons-svelte/IconFileTextBold.svelte';
	import IconUsersRegular from 'phosphor-icons-svelte/IconUsersRegular.svelte';
	import IconUsersBold from 'phosphor-icons-svelte/IconUsersBold.svelte';
	import IconGearSixRegular from 'phosphor-icons-svelte/IconGearSixRegular.svelte';
	import IconGearSixBold from 'phosphor-icons-svelte/IconGearSixBold.svelte';

	let { unreadComments = 0 }: { unreadComments?: number } = $props();

	const nav = [
		{ href: '/dashboard',          label: 'Home',     R: IconSquaresFourRegular, B: IconSquaresFourBold },
		{ href: '/dashboard/projects', label: 'Projects', R: IconFolderOpenRegular,  B: IconFolderOpenBold },
		{ href: '/dashboard/invoices', label: 'Invoices', R: IconFileTextRegular,    B: IconFileTextBold },
		{ href: '/dashboard/clients',  label: 'Clients',  R: IconUsersRegular,       B: IconUsersBold },
		{ href: '/dashboard/settings', label: 'Settings', R: IconGearSixRegular,     B: IconGearSixBold },
	];
</script>

<nav class="fixed bottom-0 inset-x-0 z-30 flex lg:hidden"
	style="background:var(--color-sidebar-bg);border-top:1px solid rgba(255,255,255,0.08);padding-bottom:env(safe-area-inset-bottom)">
	{#each nav as item}
		{@const active = page.url.pathname === item.href || (item.href !== '/dashboard' && page.url.pathname.startsWith(item.href))}
		<a href={item.href} class="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors"
			style="color:{active ? '#fff' : 'var(--color-zinc-500)'}">
			{#if active}<item.B class="h-5 w-5" />{:else}<item.R class="h-5 w-5" />{/if}
			{item.label}
			{#if item.href === '/dashboard' && unreadComments > 0}
				<span class="absolute top-2 right-[calc(50%-18px)] h-2 w-2 rounded-full" style="background:var(--color-accent-600)"></span>
			{/if}
		</a>
	{/each}
</nav>
