<script lang="ts">
	import type { PageData } from './$types';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';

	let { data }: { data: PageData } = $props();

	const statusBadge: Record<string, string> = {
		in_progress: 'badge badge-accent', review: 'badge badge-yellow',
		planning: 'badge badge-neutral',   completed: 'badge badge-green', archived: 'badge badge-neutral',
	};
	const statusLabel: Record<string, string> = {
		in_progress: 'In Progress', review: 'Review', planning: 'Planning', completed: 'Completed', archived: 'Archived',
	};

	const today = new Date().toISOString().split('T')[0];

	function progress(p: any) {
		const ms = p.milestones ?? [];
		if (!ms.length) return null;
		return Math.round((ms.filter((m: any) => m.completed).length / ms.length) * 100);
	}
</script>

<div class="space-y-8">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="page-title">Projects</h1>
			<p class="mt-1 text-sm" style="color:var(--color-text-muted)">{data.projects.length} total</p>
		</div>
		<a href="/dashboard/projects/new" class="btn btn-primary"><IconPlusRegular class="h-[15px] w-[15px]" /> New project</a>
	</div>

	<div class="overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
		{#if data.projects.length === 0}
			<div class="px-6 py-16 text-center">
				<p class="text-sm" style="color:var(--color-text-faint)">No projects yet.</p>
				<a href="/dashboard/projects/new" class="mt-2 inline-block text-sm font-medium" style="color:var(--color-accent-600)">Create your first project →</a>
			</div>
		{:else}
			{#each data.projects as p}
				{@const pct = progress(p)}
				{@const overdue = p.due_date && p.due_date < today && p.status !== 'completed'}
				<a href="/dashboard/projects/{p.id}" class="row-link" style="border-bottom:1px solid var(--color-border-subtle)">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium truncate" style="color:var(--color-text)">{p.name}</p>
						<p class="mt-0.5 text-xs" style="color:{overdue ? '#b91c1c' : 'var(--color-text-faint)'}">
							{overdue ? '⚠ Overdue · ' : (p.due_date ? 'Due ' : '')}
							{p.due_date ? new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
							· {(p.project_clients as any)?.[0]?.count ?? 0} client(s)
						</p>
					</div>
					{#if pct !== null}
						<div class="hidden sm:flex items-center gap-2">
							<div class="h-1 w-20 rounded-full overflow-hidden" style="background:var(--color-border)">
								<div class="h-full rounded-full" style="width:{pct}%;background:var(--color-accent-600)"></div>
							</div>
							<span class="text-xs w-8 text-right" style="color:var(--color-text-faint)">{pct}%</span>
						</div>
					{/if}
					<span class="{statusBadge[p.status] ?? 'badge badge-neutral'}">{statusLabel[p.status] ?? p.status}</span>
				</a>
			{/each}
		{/if}
	</div>
</div>
