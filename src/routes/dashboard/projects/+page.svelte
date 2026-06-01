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

	const today = new Date().toISOString().split('T').at(0) ?? '';

	function progress(p: any) {
		const ms = p.milestones ?? [];
		if (!ms.length) return null;
		return Math.round((ms.filter((m: any) => m.completed).length / ms.length) * 100);
	}

	const byStatus = $derived({
		active: data.projects.filter((p: any) => !['completed','archived'].includes(p.status)).length,
		review: data.projects.filter((p: any) => p.status === 'review').length,
		completed: data.projects.filter((p: any) => p.status === 'completed').length,
	});
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="page-title">Projects</h1>
			<p class="mt-0.5 text-sm" style="color:var(--color-text-muted)">{data.projects.length} total · {byStatus.active} active · {byStatus.review} in review</p>
		</div>
		<a href="/dashboard/projects/new" class="btn btn-primary"><IconPlusRegular class="h-[15px] w-[15px]" /> New project</a>
	</div>

	<div class="overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
		<!-- Table header -->
		{#if data.projects.length > 0}
			<div class="hidden sm:grid px-6 py-2.5 text-xs font-medium" style="grid-template-columns:1fr 120px 80px 100px;color:var(--color-text-faint);border-bottom:1px solid var(--color-border-subtle)">
				<span>Project</span>
				<span>Progress</span>
				<span class="text-center">Clients</span>
				<span class="text-right">Status</span>
			</div>
		{/if}

		{#if data.projects.length === 0}
			<div class="flex flex-col items-center justify-center px-6 py-20 text-center">
				<p class="text-sm" style="color:var(--color-text-faint)">No projects yet.</p>
				<a href="/dashboard/projects/new" class="mt-2 text-sm font-medium" style="color:var(--color-accent-600)">Create your first project →</a>
			</div>
		{:else}
			{#each data.projects as p}
				{@const pct = progress(p)}
				{@const overdue = p.due_date && p.due_date < today && p.status !== 'completed'}
				{@const clientCount = (p.project_clients as any)?.[0]?.count ?? 0}
				<a href="/dashboard/projects/{p.id}" class="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--color-bg)]" style="border-bottom:1px solid var(--color-border-subtle)">
					<!-- Name + due date -->
					<div class="flex flex-1 items-center gap-3 min-w-0">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
							style="background:var(--color-accent-100);color:var(--color-accent-600)">
							{p.name.at(0)?.toUpperCase()}
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium truncate" style="color:var(--color-text)">{p.name}</p>
							<p class="mt-0.5 text-xs" style="color:{overdue ? '#b91c1c' : 'var(--color-text-faint)'}">
								{overdue ? '⚠ Overdue · ' : (p.due_date ? 'Due ' : '')}
								{p.due_date ? new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
							</p>
						</div>
					</div>

					<!-- Progress bar -->
					<div class="hidden sm:flex w-[120px] items-center gap-2 shrink-0">
						{#if pct !== null}
							<div class="h-1.5 flex-1 rounded-full overflow-hidden" style="background:var(--color-border)">
								<div class="h-full rounded-full" style="width:{pct}%;background:var(--color-accent-600)"></div>
							</div>
							<span class="text-xs w-7 text-right tabular-nums" style="color:var(--color-text-faint)">{pct}%</span>
						{:else}
							<span class="text-xs" style="color:var(--color-text-faint)">—</span>
						{/if}
					</div>

					<!-- Client count -->
					<div class="hidden sm:flex w-[80px] justify-center shrink-0">
						<span class="text-xs font-medium" style="color:var(--color-text-faint)">{clientCount}</span>
					</div>

					<!-- Status badge -->
					<div class="w-[100px] flex justify-end shrink-0">
						<span class="{statusBadge[p.status] ?? 'badge badge-neutral'}">{statusLabel[p.status] ?? p.status}</span>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>
