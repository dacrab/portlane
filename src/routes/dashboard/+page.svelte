<script lang="ts">
	import type { PageData } from './$types';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';
	import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte';
	import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte';
	import IconCheckCircleRegular from 'phosphor-icons-svelte/IconCheckCircleRegular.svelte';
	import IconCurrencyDollarRegular from 'phosphor-icons-svelte/IconCurrencyDollarRegular.svelte';
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

	const stats = $derived([
		{ label: 'Active projects', value: active,          icon: IconFolderOpenRegular,    color: 'var(--color-accent-600)' },
		{ label: 'Pending review',  value: data.pending,    icon: IconClockRegular,         color: '#b45309' },
		{ label: 'Completed',       value: data.completed,  icon: IconCheckCircleRegular,   color: '#15803d' },
		{ label: 'Revenue MTD',     value: '$' + (data.revenueMTD / 100).toLocaleString('en-US', { minimumFractionDigits: 0 }), icon: IconCurrencyDollarRegular, color: '#1d4ed8' },
	]);

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
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="page-title">Dashboard</h1>
			<p class="mt-0.5 text-sm" style="color:var(--color-text-muted)">
				{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
			</p>
		</div>
		<a href="/dashboard/projects/new" class="btn btn-primary" title="New project (N)">
			<IconPlusRegular class="h-[15px] w-[15px]" /> New project
		</a>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
	{#each stats as s}
		{@const Icon = s.icon}
		<div class="card flex items-start gap-4 py-5">
			<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style="background:{s.color}18;color:{s.color}">
				<Icon class="h-4 w-4" />
			</div>
			<div>
				<p class="text-xs font-medium" style="color:var(--color-text-faint)">{s.label}</p>
				<p class="mt-1 text-2xl font-semibold tracking-tight" style="color:var(--color-text-heading)">{s.value}</p>
			</div>
		</div>
	{/each}
	</div>

	<!-- Main content -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Projects list -->
		<div class="lg:col-span-2 overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
			<div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid var(--color-border-subtle)">
				<span class="text-sm font-semibold" style="color:var(--color-text-heading)">Active projects</span>
				<a href="/dashboard/projects" class="text-xs font-medium" style="color:var(--color-accent-600)">View all →</a>
			</div>
			{#if data.projects.length === 0}
				<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
					<p class="text-sm" style="color:var(--color-text-faint)">No projects yet.</p>
					<a href="/dashboard/projects/new" class="mt-2 text-sm font-medium" style="color:var(--color-accent-600)">Create your first →</a>
				</div>
			{:else}
				{#each data.projects as p}
					<a href="/dashboard/projects/{p.id}" class="row-link" style="border-bottom:1px solid var(--color-border-subtle)">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
							style="background:var(--color-accent-100);color:var(--color-accent-600)">
							{p.name[0].toUpperCase()}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium truncate" style="color:var(--color-text)">{p.name}</p>
							{#if p.due_date}
								<p class="mt-0.5 text-xs" style="color:{isOverdue(p.due_date) ? '#b91c1c' : 'var(--color-text-faint)'}">
									{isOverdue(p.due_date) ? '⚠ Overdue · ' : 'Due '}
									{new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
								</p>
							{:else}
								<p class="mt-0.5 text-xs" style="color:var(--color-text-faint)">No due date</p>
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
				<div class="px-6 py-16 text-center text-sm" style="color:var(--color-text-faint)">No activity yet.</div>
			{:else}
				<div class="divide-y" style="border-color:var(--color-border-subtle)">
					{#each data.activity as a}
						<div class="px-5 py-4">
							<div class="flex items-start gap-2.5">
								<div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
									style="background:var(--color-accent-100);color:var(--color-accent-600)">
									{((a.profiles as any)?.full_name ?? '?')[0].toUpperCase()}
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-xs" style="color:var(--color-text-faint)">
										<span class="font-medium" style="color:var(--color-text)">{(a.profiles as any)?.full_name ?? 'Someone'}</span>
										on <span style="color:var(--color-text)">{(a.projects as any)?.name}</span>
									</p>
									<p class="mt-0.5 text-sm truncate" style="color:var(--color-text)">{a.body}</p>
									<p class="mt-0.5 text-xs" style="color:var(--color-text-faint)">
										{new Date(a.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
									</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
