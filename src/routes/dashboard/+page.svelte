<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { fmtDate, fmtDateTime, today } from '$lib/fmt';
	import Avatar from '$lib/components/Avatar.svelte';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';
	import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte';
	import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte';
	import IconCheckCircleRegular from 'phosphor-icons-svelte/IconCheckCircleRegular.svelte';
	import IconCurrencyDollarRegular from 'phosphor-icons-svelte/IconCurrencyDollarRegular.svelte';
	import IconCheckRegular from 'phosphor-icons-svelte/IconCheckRegular.svelte';
	import IconXRegular from 'phosphor-icons-svelte/IconXRegular.svelte';
	import IconBellRegular from 'phosphor-icons-svelte/IconBellRegular.svelte';

	let { data }: { data: PageData } = $props();

	// Auto-dismiss: mark all as read when the dashboard is visited
	onMount(async () => {
		if (data.unreadComments.length > 0) {
			await fetch('?/mark_read', { method: 'POST' });
			invalidateAll();
		}
	});

	let onboardingDismissed = $state(
		typeof localStorage !== 'undefined' && localStorage.getItem('onboarding_dismissed') === '1'
	);
	function dismissOnboarding() {
		localStorage.setItem('onboarding_dismissed', '1');
		onboardingDismissed = true;
	}

	const showOnboarding = $derived(!onboardingDismissed && !data.onboardingDone);

	const statusBadge: Record<string, string> = {
		in_progress: 'badge badge-accent', review: 'badge badge-yellow',
		planning: 'badge badge-neutral',   completed: 'badge badge-green',
	};
	const statusLabel: Record<string, string> = {
		in_progress: 'In Progress', review: 'Review', planning: 'Planning', completed: 'Completed',
	};

	const isOverdue = (due: string | null) => due && due < today();

	const stats = $derived([
		{ label: 'Active projects', value: data.active,     icon: IconFolderOpenRegular,    color: 'var(--color-accent-600)' },
		{ label: 'Pending review',  value: data.pending,    icon: IconClockRegular,         color: '#b45309' },
		{ label: 'Completed',       value: data.completed,  icon: IconCheckCircleRegular,   color: '#15803d' },
		{ label: 'Revenue MTD',     value: '$' + (data.revenueMTD / 100).toLocaleString('en-US', { minimumFractionDigits: 0 }), icon: IconCurrencyDollarRegular, color: '#1d4ed8' },
	]);

	const onboardingSteps = $derived([
		{ label: 'Set your name in Settings', done: data.onboarding.hasProfile, href: '/dashboard/settings' },
		{ label: 'Create your first project', done: data.onboarding.hasProject, href: '/dashboard/projects/new' },
		{ label: 'Invite a client to a project', done: data.onboarding.hasClient, href: '/dashboard/projects' },
		{ label: 'Send your first invoice', done: data.onboarding.hasInvoice, href: '/dashboard/invoices' },
	]);
</script>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">Overview</p>
			<h1 class="page-title">Good morning 👋</h1>
			<p class="mt-0.5 text-sm text-muted">
				{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
			</p>
		</div>
		<a href="/dashboard/projects" class="btn btn-primary shrink-0">
			<IconPlusRegular class="h-[15px] w-[15px]" /><span class="hidden sm:inline"> New project</span>
		</a>
	</div>

	<!-- Unread client comments (auto-dismissed on mount) -->
	{#if data.unreadComments.length > 0}
		<div class="rounded-xl overflow-hidden surface">
			<div class="flex items-center gap-2 px-5 py-3.5 divide-bottom">
				<span class="text-accent"><IconBellRegular class="h-4 w-4" /></span>
				<span class="text-sm font-semibold text-heading">New client messages</span>
				<span class="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold bg-accent-pill">{data.unreadComments.length}</span>
			</div>
			<div>
				{#each data.unreadComments as c}
					<a href="/dashboard/projects/{c.project_id}"
						class="flex items-start gap-3 px-5 py-4 transition-colors hover-bg no-underline divide-bottom">
						<Avatar name={c.author_name ?? '?'} size={7} />
						<div class="flex-1 min-w-0">
							<p class="text-xs text-faint">
								<span class="font-medium text-body">{c.author_name ?? 'Client'}</span>
								{' '}commented on{' '}
								<span class="font-medium text-body">{c.project_name}</span>
							</p>
							<p class="mt-0.5 text-sm truncate text-body">{c.body}</p>
							<p class="mt-0.5 text-xs text-faint">{fmtDateTime(c.created_at!)}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Onboarding checklist -->
	{#if showOnboarding}
		<div class="rounded-xl p-5" style="border:1px solid var(--color-accent-200);background:var(--color-accent-50)">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm font-semibold text-accent">Get started with Portlane</p>
					<p class="mt-0.5 text-xs text-muted">Complete these steps to set up your workspace.</p>
				</div>
				<button onclick={dismissOnboarding} class="btn-icon shrink-0 -mt-0.5 -mr-1" title="Dismiss">
					<IconXRegular class="h-3.5 w-3.5" />
				</button>
			</div>
			<div class="mt-4 grid gap-2 sm:grid-cols-2">
				{#each onboardingSteps as step}
					<a href={step.href} class="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:opacity-80 no-underline"
						style="background:{step.done ? 'rgba(124,58,237,0.08)' : 'var(--color-bg-elevated)'}">
						<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
							style="background:{step.done ? 'var(--color-accent-600)' : 'var(--color-border)'};color:#fff">
							{#if step.done}<IconCheckRegular class="h-3 w-3" />{/if}
						</span>
						<span class="text-xs" style="color:{step.done ? 'var(--color-text-faint)' : 'var(--color-text)'};text-decoration:{step.done ? 'line-through' : 'none'}">{step.label}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Stats -->
	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
	{#each stats as s}
		{@const Icon = s.icon}
		<div class="card flex flex-col gap-3">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg" style="background:{s.color}15;color:{s.color}">
				<Icon class="h-4 w-4" />
			</div>
			<div>
				<p class="text-sm text-muted">{s.label}</p>
				<p class="mt-0.5 text-2xl font-semibold tracking-tight text-heading">{s.value}</p>
			</div>
		</div>
	{/each}
	</div>

	<!-- Main content -->
	<div class="grid gap-5 lg:grid-cols-3">
		<!-- Projects list -->
		<div class="lg:col-span-2 overflow-hidden rounded-xl surface">
			<div class="flex items-center justify-between px-5 py-3.5 divide-bottom">
				<span class="section-label">Active projects</span>
				<a href="/dashboard/projects" class="text-xs font-medium text-accent hover:underline">View all →</a>
			</div>
			{#if data.projects.length === 0}
				<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
					<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-subtle">
						<span class="text-faint"><IconFolderOpenRegular class="h-6 w-6" /></span>
					</div>
					<p class="text-sm font-medium text-body">No projects yet</p>
					<p class="mt-1 text-xs text-faint">Create your first project to get started.</p>
					<a href="/dashboard/projects" class="mt-4 btn btn-primary text-xs px-4">Create project</a>
				</div>
			{:else}
				{#each data.projects as p}
					<a href="/dashboard/projects/{p.id}" class="row-link divide-bottom">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
							style="background:var(--color-accent-100);color:var(--color-accent-600)">
							{p.name.at(0)?.toUpperCase()}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium truncate text-body">{p.name}</p>
							{#if p.due_date}
								<p class="mt-0.5 text-xs" class:text-danger={isOverdue(p.due_date)} class:text-faint={!isOverdue(p.due_date)}>
									{isOverdue(p.due_date) ? '⚠ Overdue · ' : 'Due '}
									{fmtDate(p.due_date)}
								</p>
							{:else}
								<p class="mt-0.5 text-xs text-faint">No due date</p>
							{/if}
						</div>
						<span class="{statusBadge[p.status] ?? 'badge badge-neutral'}">{statusLabel[p.status] ?? p.status}</span>
					</a>
				{/each}
			{/if}
		</div>

		<!-- Activity feed -->
		<div class="overflow-hidden rounded-xl surface">
			<div class="px-5 py-3.5 divide-bottom">
				<span class="section-label">Recent activity</span>
			</div>
			{#if data.activity.length === 0}
				<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
					<p class="text-sm text-faint">No activity yet.</p>
					<p class="mt-1 text-xs text-faint">Comments from clients will appear here.</p>
				</div>
			{:else}
				<div class="divide-y" style="border-color:var(--color-border-subtle)">
					{#each data.activity as a}
						<div class="px-5 py-4">
							<div class="flex items-start gap-2.5">
								<Avatar name={a.author_name ?? '?'} size={6} />
								<div class="flex-1 min-w-0">
									<p class="text-xs text-faint">
										<span class="font-medium text-body">{a.author_name ?? 'Someone'}</span>
										on <span class="text-body">{a.project_name}</span>
									</p>
									<p class="mt-0.5 text-sm truncate text-body">{a.body}</p>
									<p class="mt-0.5 text-xs text-faint">{fmtDateTime(a.created_at!)}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
