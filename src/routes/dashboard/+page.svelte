<script lang="ts">
	import type { PageData } from './$types';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const statusBadge: Record<string, string> = {
		in_progress: 'badge badge-accent', review: 'badge badge-yellow',
		planning: 'badge badge-neutral',   completed: 'badge badge-green',
	};
	const statusLabel: Record<string, string> = {
		in_progress: 'In Progress', review: 'Review', planning: 'Planning', completed: 'Completed',
	};

	const active = $derived(data.projects.filter((p: any) => p.status !== 'completed').length);
	const today = new Date().toISOString().split('T')[0];
	const isOverdue = (due: string | null) => due && due < today;

	// Keyboard shortcut: N → new project
	onMount(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'n' && !['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName)) {
				goto('/dashboard/projects/new');
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});
</script>

<div class="space-y-8">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="page-title">Dashboard</h1>
			<p class="mt-1 text-sm" style="color:var(--color-text-muted)">Here's what's happening.</p>
		</div>
		<a href="/dashboard/projects/new" class="btn btn-primary" title="New project (N)">
			<IconPlusRegular class="h-[15px] w-[15px]" /> New project
		</a>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-4 gap-4">
		{#each [
			['Active', active],
			['Pending review', data.pending],
			['Completed', data.completed],
			['Revenue MTD', '$' + (data.revenueMTD / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })],
		] as [label, value]}
			<div class="card">
				<p class="text-xs font-medium uppercase tracking-wide" style="color:var(--color-text-faint)">{label}</p>
				<p class="mt-3 text-3xl font-semibold tracking-tight" style="color:var(--color-text-heading)">{value}</p>
			</div>
		{/each}
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Projects -->
		<div class="lg:col-span-2 overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
			<div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--color-border-subtle)">
				<span class="text-sm font-semibold" style="color:var(--color-text-heading)">Projects</span>
				<a href="/dashboard/projects" class="text-xs font-medium" style="color:var(--color-accent-600)">View all →</a>
			</div>
			{#if data.projects.length === 0}
				<div class="px-6 py-12 text-center text-sm" style="color:var(--color-text-faint)">No projects yet.</div>
			{:else}
				{#each data.projects as p}
					<a href="/dashboard/projects/{p.id}" class="row-link" style="border-bottom:1px solid var(--color-border-subtle)">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium truncate" style="color:var(--color-text)">{p.name}</p>
							{#if p.due_date}
								<p class="mt-0.5 text-xs" style="color:{isOverdue(p.due_date) ? '#b91c1c' : 'var(--color-text-faint)'}">
									{isOverdue(p.due_date) ? '⚠ Overdue · ' : 'Due '}
									{new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
								</p>
							{/if}
						</div>
						<span class="{statusBadge[p.status] ?? 'badge badge-neutral'}">{statusLabel[p.status] ?? p.status}</span>
					</a>
				{/each}
			{/if}
		</div>

		<!-- Activity feed -->
		<div class="overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
			<div class="px-6 py-4" style="border-bottom:1px solid var(--color-border-subtle)">
				<span class="text-sm font-semibold" style="color:var(--color-text-heading)">Recent activity</span>
			</div>
			{#if data.activity.length === 0}
				<div class="px-6 py-12 text-center text-sm" style="color:var(--color-text-faint)">No activity yet.</div>
			{:else}
				<div class="divide-y" style="border-color:var(--color-border-subtle)">
					{#each data.activity as a}
						<div class="px-5 py-3.5">
							<p class="text-xs font-medium" style="color:var(--color-text-faint)">
								{(a.profiles as any)?.full_name ?? 'Someone'} on <span style="color:var(--color-text)">{(a.projects as any)?.name}</span>
							</p>
							<p class="mt-0.5 text-sm truncate" style="color:var(--color-text)">{a.body}</p>
							<p class="mt-0.5 text-xs" style="color:var(--color-text-faint)">
								{new Date(a.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
