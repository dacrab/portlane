<script lang="ts">
import IconMoonRegular from 'phosphor-icons-svelte/IconMoonRegular.svelte'
import IconSignOutRegular from 'phosphor-icons-svelte/IconSignOutRegular.svelte'
import IconSunRegular from 'phosphor-icons-svelte/IconSunRegular.svelte'
import { onMount } from 'svelte'
import { authClient } from '#lib/auth-client.js'
import { navItems } from '#lib/nav.js'
import Logo from '#lib/ui/Logo.svelte'
import { goto } from '$app/navigation'
import { page } from '$app/state'

let {
	user,
	unreadComments = 0,
}: {
	user: { userId: string; email: string; role: string } | null
	unreadComments?: number
} = $props()

let dark = $state(false)

onMount(() => {
	dark = document.documentElement.classList.contains('dark')
})

function toggleDark() {
	dark = !dark
	document.documentElement.classList.toggle('dark', dark)
	localStorage.setItem('theme', dark ? 'dark' : 'light')
}

async function signOut() {
	await authClient.signOut()
	goto('/')
}

const primary = navItems.slice(0, 4)
const secondary = navItems.slice(4)
</script>

<aside class="flex h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface">
	<div class="flex h-14 items-center px-5">
		<Logo size="sm" href="/dashboard" />
	</div>

	<nav class="flex-1 px-3 py-4">
		<p class="mb-2 px-2 text-[11px] font-medium text-faint">Workspace</p>
		<ul class="space-y-0.5">
			{#each primary as item (item.href)}
				{@const active = page.url.pathname === item.href || (item.href !== '/dashboard' && page.url.pathname.startsWith(item.href))}
				<li>
					<a
						href={item.href}
						class="group flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors {active ? 'bg-accent/10 font-medium text-accent' : 'text-body hover:bg-raised hover:text-ink'}"
					>
						{#if active}
							<item.B class="h-4 w-4 shrink-0" />
						{:else}
							<item.R class="h-4 w-4 shrink-0 text-muted group-hover:text-ink" />
						{/if}
						<span class="flex-1">{item.label}</span>
						{#if item.href === '/dashboard' && unreadComments > 0}
							<span class="flex h-4 min-w-4 items-center justify-center rounded-xs bg-accent px-1 text-[10px] font-medium text-page">
								{unreadComments > 9 ? '9+' : unreadComments}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="border-t border-line p-3">
		<ul class="space-y-0.5">
			{#each secondary as item (item.href)}
				{@const active = page.url.pathname === item.href}
				<li>
					<a
						href={item.href}
						class="group flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors {active ? 'bg-accent/10 font-medium text-accent' : 'text-body hover:bg-raised hover:text-ink'}"
					>
						{#if active}
							<item.B class="h-4 w-4 shrink-0" />
						{:else}
							<item.R class="h-4 w-4 shrink-0 text-muted group-hover:text-ink" />
						{/if}
						<span class="flex-1">{item.label}</span>
					</a>
				</li>
			{/each}
			<li>
				<button
					type="button"
					onclick={toggleDark}
					class="group flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-[13px] text-body transition-colors hover:bg-raised hover:text-ink"
				>
					{#if dark}
						<IconSunRegular class="h-4 w-4 shrink-0 text-muted group-hover:text-ink" />
						<span class="flex-1 text-left">Light mode</span>
					{:else}
						<IconMoonRegular class="h-4 w-4 shrink-0 text-muted group-hover:text-ink" />
						<span class="flex-1 text-left">Dark mode</span>
					{/if}
				</button>
			</li>
		</ul>

		<div class="mt-2 flex items-center gap-2.5 border-t border-line px-2 pt-3">
			<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-raised text-[11px] font-medium uppercase text-body">
				{user?.email?.charAt(0) ?? '?'}
			</div>
			<p class="min-w-0 flex-1 truncate text-[11px] text-muted">{user?.email ?? ''}</p>
			<button
				type="button"
				onclick={signOut}
				class="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-raised hover:text-ink"
				title="Sign out"
				aria-label="Sign out"
			>
				<IconSignOutRegular class="h-4 w-4" />
			</button>
		</div>
	</div>
</aside>
