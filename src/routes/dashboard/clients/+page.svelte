<script lang="ts">
import IconUsersRegular from 'phosphor-icons-svelte/IconUsersRegular.svelte'
import Avatar from '$lib/components/Avatar.svelte'
import EmptyState from '$lib/components/EmptyState.svelte'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()
</script>

<div>
	<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">People</p>
	<h1 class="page-title">Clients</h1>
	<p class="mt-0.5 text-sm text-muted">{data.clients.length} total</p>
</div>

{#if data.clients.length === 0}
	<div class="card rounded-xl"><EmptyState icon={IconUsersRegular} title="No clients yet" description="Invite clients from a project's detail page." action={{ label: 'Go to projects', href: '/dashboard/projects' }} /></div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#each data.clients as c}
			{@const name = c.name ?? 'Unknown'}
			<div class="card flex flex-col gap-4">
				<div class="flex items-center gap-3">
					<Avatar {name} size={10} />
					<div class="min-w-0">
						<p class="text-sm font-semibold truncate text-heading">{name}</p>
						<p class="text-xs text-faint">{c.projects.length} project{c.projects.length !== 1 ? 's' : ''}</p>
					</div>
				</div>
				{#if c.projects.length > 0}
					<div class="space-y-1">
						{#each c.projects as proj}
							<p class="truncate rounded px-2 py-1 text-xs" style="background:var(--color-bg-subtle);color:var(--color-text-muted)">{proj}</p>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
