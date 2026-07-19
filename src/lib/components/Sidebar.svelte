<script lang="ts">
import IconMoonRegular from 'phosphor-icons-svelte/IconMoonRegular.svelte'
import IconSidebarSimpleRegular from 'phosphor-icons-svelte/IconSidebarSimpleRegular.svelte'
import IconSignOutRegular from 'phosphor-icons-svelte/IconSignOutRegular.svelte'
import IconSunRegular from 'phosphor-icons-svelte/IconSunRegular.svelte'
import { onMount } from 'svelte'
import { page } from '$app/state'
import { authClient } from '$lib/auth-client'
import { navItems } from '$lib/nav'
import { sidebarCollapsed } from '$lib/stores.svelte'

let {
	user,
	unreadComments = 0,
}: {
	user: { userId: string; email: string; role: string } | null
	unreadComments?: number
} = $props()

let collapsed = $derived(sidebarCollapsed.value)
let dark = $state(false)

function toggle() {
	sidebarCollapsed.toggle()
}

onMount(() => {
	dark = document.documentElement.classList.contains('dark')
})

function toggleDark() {
	dark = !dark
	if (dark) {
		document.documentElement.classList.add('dark')
		localStorage.setItem('theme', 'dark')
	} else {
		document.documentElement.classList.remove('dark')
		localStorage.setItem('theme', 'light')
	}
}

const settingsItem = navItems[4]
if (!settingsItem) throw new Error('Missing settings nav item')
</script>

<aside
	class="flex h-screen shrink-0 flex-col transition-[width] duration-200"
	style="background:var(--color-sidebar-bg);width:{collapsed ? '3.25rem' : '13rem'};overflow:hidden;border-right:1px solid rgba(255,255,255,0.05)"
>
	<!-- Logo -->
	<div class="flex items-center gap-2 px-3 py-3.5" style="border-bottom:1px solid rgba(255,255,255,0.05)">
		<a href="/" class="flex items-center gap-2 min-w-0" title="Portlane">
			<img src="/favicon.svg" alt="Portlane" class="h-5 w-5 shrink-0 opacity-90" />
			{#if !collapsed}
				<span class="text-[13px] font-semibold tracking-tight whitespace-nowrap" style="color:rgba(255,255,255,0.85)">Portlane</span>
			{/if}
		</a>
		{#if !collapsed}
			<button onclick={toggle} class="ml-auto shrink-0 rounded p-1 transition-colors" style="color:rgba(255,255,255,0.2)" title="Collapse">
				<IconSidebarSimpleRegular class="h-3.5 w-3.5" />
			</button>
		{/if}
	</div>

	<!-- Nav -->
	<nav class="flex flex-1 flex-col gap-0.5 px-1.5 py-2.5">
		{#each navItems.slice(0, 4) as item}
			{@const active = page.url.pathname === item.href || (item.href !== '/dashboard' && page.url.pathname.startsWith(item.href))}
			<a href={item.href} class="nav-item relative {active ? 'active' : ''} {collapsed ? 'justify-center px-0' : ''}" title={collapsed ? item.label : ''}>
				{#if active}<item.B class="h-[15px] w-[15px] shrink-0" />{:else}<item.R class="h-[15px] w-[15px] shrink-0" />{/if}
				{#if !collapsed}
					<span class="flex-1 whitespace-nowrap">{item.label}</span>
					{#if item.href === '/dashboard' && unreadComments > 0}
						<span class="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
							style="background:var(--color-accent-600);color:#fff">{unreadComments > 9 ? '9+' : unreadComments}</span>
					{/if}
				{:else if item.href === '/dashboard' && unreadComments > 0}
					<span class="absolute top-1 right-1 h-1.5 w-1.5 rounded-full" style="background:var(--color-accent-600)"></span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Bottom -->
	<div class="px-1.5 pb-2.5" style="border-top:1px solid rgba(255,255,255,0.05)">
		<div class="pt-2 flex flex-col gap-0.5">
			<button onclick={toggleDark} class="nav-item w-full {collapsed ? 'justify-center px-0' : ''}"
				title={collapsed ? (dark ? 'Light mode' : 'Dark mode') : ''}>
				{#if dark}
					<IconSunRegular class="h-[15px] w-[15px] shrink-0" />
					{#if !collapsed}<span class="whitespace-nowrap">Light mode</span>{/if}
				{:else}
					<IconMoonRegular class="h-[15px] w-[15px] shrink-0" />
					{#if !collapsed}<span class="whitespace-nowrap">Dark mode</span>{/if}
				{/if}
			</button>
			<a href={settingsItem.href} class="nav-item {page.url.pathname === settingsItem.href ? 'active' : ''} {collapsed ? 'justify-center px-0' : ''}" title={collapsed ? settingsItem.label : ''}>
				{#if page.url.pathname === settingsItem.href}<settingsItem.B class="h-[15px] w-[15px] shrink-0" />{:else}<settingsItem.R class="h-[15px] w-[15px] shrink-0" />{/if}
				{#if !collapsed}<span class="whitespace-nowrap">{settingsItem.label}</span>{/if}
			</a>
			{#if collapsed}
				<button onclick={toggle} class="nav-item w-full justify-center px-0" title="Expand">
					<IconSidebarSimpleRegular class="h-[15px] w-[15px] shrink-0" />
				</button>
			{/if}
		</div>

		<!-- User -->
		<div class="mt-2 pt-2" style="border-top:1px solid rgba(255,255,255,0.05)">
			{#if !collapsed}
				<div class="flex items-center gap-2 rounded-md px-2 py-1.5" style="background:rgba(255,255,255,0.03)">
					<div class="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold uppercase" style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.6)">
						{user?.email?.charAt(0) ?? '?'}
					</div>
					<p class="flex-1 truncate text-[11px]" style="color:rgba(255,255,255,0.3)">{user?.email ?? ''}</p>
					<button onclick={() => authClient.signOut()} class="shrink-0 p-1 rounded hover:bg-white/10" title="Sign out">
						<span style="color:rgba(255,255,255,0.3)"><IconSignOutRegular class="h-3.5 w-3.5" /></span>
					</button>
				</div>
			{:else}
				<div class="flex justify-center">
					<button onclick={() => authClient.signOut()} class="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10" title="Sign out">
						<span class="text-[10px] font-semibold uppercase" style="color:rgba(255,255,255,0.6)">{user?.email?.charAt(0) ?? '?'}</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
</aside>
