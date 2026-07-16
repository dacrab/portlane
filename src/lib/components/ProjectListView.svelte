<script lang="ts">
import Avatar from '$lib/components/Avatar.svelte'
import EmptyState from '$lib/components/EmptyState.svelte'
import { fmtDate } from '$lib/fmt'
import type { PageData } from '../../routes/portal/$types'

type WithProfile = { profiles: { full_name: string | null } | null }

let { data }: { data: PageData } = $props()
</script>

<!-- Project list -->
<div class="max-w-[40rem]">
	<div class="mb-6">
		<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">Client Portal</p>
		<h1 class="page-title">Your projects</h1>
	</div>
	{#if data.projects.length === 0}
		<div class="card"><EmptyState title="No projects yet" description="Your freelancer hasn't added you to any projects yet." compact /></div>
	{:else}
		<div class="space-y-3">
			{#each data.projects as p}
				<a href="/portal?project={p.id}" class="card flex items-center gap-4 no-underline hover-bg transition-colors">
					<Avatar name={p.name} size={10} />
					<div class="flex-1 min-w-0">
						<p class="text-sm font-semibold text-heading">{p.name}</p>
						<p class="text-xs text-faint">
							{'profiles' in p ? ((p as WithProfile).profiles?.full_name ?? 'Freelancer') : 'Freelancer'}
							{#if p.due_date} · Due {fmtDate(p.due_date)}{/if}
						</p>
					</div>
					<span class="badge badge-neutral shrink-0">{p.status.replace('_', ' ')}</span>
				</a>
			{/each}
		</div>
	{/if}
</div>
