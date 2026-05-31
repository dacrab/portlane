<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import IconSquaresFourRegular from 'phosphor-icons-svelte/IconSquaresFourRegular.svelte';
	import IconSquaresFourBold from 'phosphor-icons-svelte/IconSquaresFourBold.svelte';
	import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte';
	import IconFolderOpenBold from 'phosphor-icons-svelte/IconFolderOpenBold.svelte';
	import IconFileTextRegular from 'phosphor-icons-svelte/IconFileTextRegular.svelte';
	import IconFileTextBold from 'phosphor-icons-svelte/IconFileTextBold.svelte';
	import IconUsersRegular from 'phosphor-icons-svelte/IconUsersRegular.svelte';
	import IconUsersBold from 'phosphor-icons-svelte/IconUsersBold.svelte';
	import IconSignOutRegular from 'phosphor-icons-svelte/IconSignOutRegular.svelte';
	import IconSidebarSimpleRegular from 'phosphor-icons-svelte/IconSidebarSimpleRegular.svelte';
	import IconGearSixRegular from 'phosphor-icons-svelte/IconGearSixRegular.svelte';
	import IconGearSixBold from 'phosphor-icons-svelte/IconGearSixBold.svelte';
	import type { User } from '@supabase/supabase-js';
	import { sidebarCollapsed } from '$lib/stores';

	let { user }: { user: User | null } = $props();

	const nav = [
		{ href: '/dashboard',          label: 'Dashboard', R: IconSquaresFourRegular, B: IconSquaresFourBold },
		{ href: '/dashboard/projects', label: 'Projects',  R: IconFolderOpenRegular,  B: IconFolderOpenBold },
		{ href: '/dashboard/invoices', label: 'Invoices',  R: IconFileTextRegular,    B: IconFileTextBold },
		{ href: '/dashboard/clients',  label: 'Clients',   R: IconUsersRegular,       B: IconUsersBold },
	];

	let collapsed = $state(false);
	sidebarCollapsed.subscribe(v => collapsed = v);
	function toggle() { sidebarCollapsed.update(v => !v); }

	const settingsActive = $derived(page.url.pathname.startsWith('/dashboard/settings'));
</script>

<aside
	class="flex h-screen shrink-0 flex-col py-4 transition-[width] duration-200"
	style="background:var(--color-sidebar-bg);width:{collapsed ? '3.5rem' : '13rem'};overflow:hidden"
>
	<div class="mb-6 px-3">
		<a href="/" class="flex items-center gap-2 py-1" title="Portlane">
			<img src="/favicon.svg" alt="Portlane" class="h-6 w-6 shrink-0" />
			{#if !collapsed}
				<span class="text-[13px] font-semibold tracking-tight whitespace-nowrap" style="color:rgba(255,255,255,0.9)">Portlane</span>
			{/if}
		</a>
	</div>

	<nav class="flex flex-1 flex-col gap-0.5 px-2">
		{#each nav as item}
			{@const active = page.url.pathname === item.href || (item.href !== '/dashboard' && page.url.pathname.startsWith(item.href))}
			<a href={item.href} class="nav-item {active ? 'active' : ''} {collapsed ? 'justify-center' : ''}" title={collapsed ? item.label : ''}>
				{#if active}<item.B class="h-[15px] w-[15px] shrink-0" />{:else}<item.R class="h-[15px] w-[15px] shrink-0" />{/if}
				{#if !collapsed}<span class="whitespace-nowrap">{item.label}</span>{/if}
			</a>
		{/each}
	</nav>

	<div class="px-2 pt-3 space-y-1" style="border-top:1px solid rgba(255,255,255,0.08)">
		<a href="/dashboard/settings" class="nav-item {settingsActive ? 'active' : ''} {collapsed ? 'justify-center' : ''}" title={collapsed ? 'Settings' : ''}>
			{#if settingsActive}<IconGearSixBold class="h-[15px] w-[15px] shrink-0" />{:else}<IconGearSixRegular class="h-[15px] w-[15px] shrink-0" />{/if}
			{#if !collapsed}<span class="whitespace-nowrap">Settings</span>{/if}
		</a>
		<button onclick={toggle} class="nav-item w-full {collapsed ? 'justify-center' : ''}" title={collapsed ? 'Expand' : 'Collapse'}>
			<IconSidebarSimpleRegular class="h-[15px] w-[15px] shrink-0" />
			{#if !collapsed}<span class="whitespace-nowrap">Collapse</span>{/if}
		</button>
		<div style="border-top:1px solid rgba(255,255,255,0.08)" class="pt-1 space-y-1">
			{#if !collapsed && user}
				<p class="truncate px-3 py-1 text-[12px]" style="color:var(--color-sidebar-text)">{user.email}</p>
			{/if}
			<form method="POST" action="/logout" use:enhance>
				<button type="submit" class="nav-item w-full {collapsed ? 'justify-center' : ''}" title={collapsed ? 'Sign out' : ''}>
					<IconSignOutRegular class="h-[15px] w-[15px] shrink-0" />
					{#if !collapsed}<span class="whitespace-nowrap">Sign out</span>{/if}
				</button>
			</form>
		</div>
	</div>
</aside>
