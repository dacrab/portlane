<script lang="ts">
import IconUsersRegular from 'phosphor-icons-svelte/IconUsersRegular.svelte'
import Avatar from '#lib/ui/Avatar.svelte'
import EmptyState from '#lib/ui/EmptyState.svelte'
import PageHeader from '#lib/ui/PageHeader.svelte'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()
</script>

<div class="space-y-8">
	<PageHeader
		title="Clients"
		description="{data.clients.length} total"
	/>

	{#if data.clients.length === 0}
		<div class="rounded-lg border border-line bg-surface">
			<EmptyState
				icon={IconUsersRegular}
				title="No clients yet"
				description="Invite clients from a project to give them portal access."
				action={{ label: 'Go to projects', href: '/dashboard/projects' }}
			/>
		</div>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each data.clients as client (client.id)}
				<li class="rounded-lg border border-line bg-surface p-5">
					<div class="flex items-center gap-3">
						<Avatar name={client.name} size={9} />
						<div class="min-w-0">
							<p class="truncate text-[13px] font-medium text-ink">{client.name}</p>
							<p class="mt-0.5 text-[11px] text-muted">
								{client.projects.length}
								{client.projects.length === 1 ? 'project' : 'projects'}
							</p>
						</div>
					</div>

					{#if client.projects.length > 0}
						<ul class="mt-4 space-y-1">
							{#each client.projects as project (project)}
								<li class="truncate rounded-xs bg-raised px-2 py-1 text-[11px] text-body">
									{project}
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
