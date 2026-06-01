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

	const initials = $derived(
		(user?.email ?? '?').slice(0, 2).toUpperCase()
	);
</script>

<aside
	class="flex h-screen shrink-0 flex-col transition-[width] duration-200"
	style="background:var(--color-sidebar-bg);width:{collapsed ? '3.5rem' : '13.5rem'};overflow:hidden"
>
	<!-- Logo -->
	<div class="flex items-center gap-2.5 px-4 py-4" style="border-bottom:1px solid rgba(255,255,255,0.06)">
		<a href="/" class="flex items-center gap-2.5 py-0.5" title="Portlane">
			<img src="/favicon.svg" alt="Portlane" class="h-6 w-6 shrink-0" />
			{#if !collapsed}
				<span class="text-[13px] font-semibold tracking-tight whitespace-nowrap" style="color:rgba(255,255,255,0.9)">Portlane</span>
			{/if}
		</a>
		{#if !collapsed}
			<button onclick={toggle} class="ml-auto rounded p-1 transition-colors" style="color:var(--color-zinc-500)" title="Collapse">
				<IconSidebarSimpleRegular class="h-4 w-4" />
			</button>
		{/if}
	</div>

	<!-- Nav -->
	<nav class="flex flex-1 flex-col gap-0.5 px-2 py-3">
		{#each nav as item}
			{@const active = page.url.pathname === item.href || (item.href !== '/dashboard' && page.url.pathname.startsWith(item.href))}
			<a href={item.href} class="nav-item {active ? 'active' : ''} {collapsed ? 'justify-center' : ''}" title={collapsed ? item.label : ''}>
				{#if active}<item.B class="h-[15px] w-[15px] shrink-0" />{:else}<item.R class="h-[15px] w-[15px] shrink-0" />{/if}
				{#if !collapsed}<span class="whitespace-nowrap">{item.label}</span>{/if}
			</a>
		{/each}
	</nav>

	<!-- Bottom -->
	<div class="px-2 pb-3 space-y-0.5" style="border-top:1px solid rgba(255,255,255,0.06)">
		<div class="pt-2 space-y-0.5">
			<a href="/dashboard/settings" class="nav-item {settingsActive ? 'active' : ''} {collapsed ? 'justify-center' : ''}" title={collapsed ? 'Settings' : ''}>
				{#if settingsActive}<IconGearSixBold class="h-[15px] w-[15px] shrink-0" />{:else}<IconGearSixRegular class="h-[15px] w-[15px] shrink-0" />{/if}
				{#if !collapsed}<span class="whitespace-nowrap">Settings</span>{/if}
			</a>
			{#if collapsed}
				<button onclick={toggle} class="nav-item w-full justify-center" title="Expand">
					<IconSidebarSimpleRegular class="h-[15px] w-[15px] shrink-0" />
				</button>
			{/if}
		</div>

		<!-- User row -->
		<div class="mt-1 pt-2" style="border-top:1px solid rgba(255,255,255,0.06)">
			{#if !collapsed}
				<div class="flex items-center gap-2.5 px-2 py-1.5 rounded-md" style="background:rgba(255,255,255,0.04)">
					<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
						style="background:var(--color-accent-600);color:#fff">{initials}</div>
					<p class="flex-1 truncate text-[12px]" style="color:var(--color-zinc-400)">{user?.email ?? ''}</p>
					<form method="POST" action="/logout" use:enhance>
						<button type="submit" class="rounded p-1 transition-colors" style="color:var(--color-zinc-500)" title="Sign out">
							<IconSignOutRegular class="h-3.5 w-3.5" />
						</button>
					</form>
				</div>
			{:else}
				<form method="POST" action="/logout" use:enhance>
					<button type="submit" class="nav-item w-full justify-center" title="Sign out">
						<IconSignOutRegular class="h-[15px] w-[15px] shrink-0" />
					</button>
				</form>
			{/if}
		</div>
	</div>
</aside>
