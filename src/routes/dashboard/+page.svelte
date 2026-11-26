<script lang="ts">
import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte'
import IconCheckBold from 'phosphor-icons-svelte/IconCheckBold.svelte'
import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte'
import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte'
import IconXRegular from 'phosphor-icons-svelte/IconXRegular.svelte'
import { onMount } from 'svelte'
import { LOCALE } from '#lib/constants.js'
import {
	formatDate,
	formatDateTime,
	formatMoney,
	todayISO,
} from '#lib/domain/format.js'
import {
	PROJECT_STATUS_LABEL,
	PROJECT_STATUS_TONE,
} from '#lib/domain/status.js'
import Avatar from '#lib/ui/Avatar.svelte'
import Badge from '#lib/ui/Badge.svelte'
import Button from '#lib/ui/Button.svelte'
import EmptyState from '#lib/ui/EmptyState.svelte'
import PageHeader from '#lib/ui/PageHeader.svelte'
import Section from '#lib/ui/Section.svelte'
import Stat from '#lib/ui/Stat.svelte'
import { browser } from '$app/env'
import { refreshAll } from '$app/navigation'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()

onMount(() => {
	if (data.unreadCommentRows.length > 0) {
		fetch('?/mark_read', { method: 'POST' }).then(() => refreshAll())
	}
})

let onboardingDismissed = $state(
	browser && localStorage.getItem('onboarding_dismissed') === '1',
)

function dismissOnboarding() {
	localStorage.setItem('onboarding_dismissed', '1')
	onboardingDismissed = true
}

const showOnboarding = $derived(!(onboardingDismissed || data.onboardingDone))

const steps = $derived([
	{
		label: 'Set your name',
		done: data.onboarding.hasProfile,
		href: '/dashboard/settings',
	},
	{
		label: 'Create a project',
		done: data.onboarding.hasProject,
		href: '/dashboard/projects?new=1',
	},
	{
		label: 'Invite a client',
		done: data.onboarding.hasClient,
		href: '/dashboard/projects',
	},
	{
		label: 'Send an invoice',
		done: data.onboarding.hasInvoice,
		href: '/dashboard/invoices',
	},
])

const today = $derived(
	new Date().toLocaleDateString(LOCALE, {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	}),
)
</script>

<div class="space-y-8">
	<PageHeader
		title="Welcome back"
		description={today}
	>
		{#snippet actions()}
			<Button href="/dashboard/projects?new=1" size="sm">
				<IconPlusRegular class="h-4 w-4" />
				New project
			</Button>
		{/snippet}
	</PageHeader>

	{#if data.unreadCommentRows.length > 0}
		<Section
			title="New from clients"
			meta={String(data.unreadCommentRows.length)}
			flush
		>
			<ul class="divide-y divide-line">
				{#each data.unreadCommentRows as comment (comment.id)}
					<li>
						<a
							href="/dashboard/projects/{comment.projectId}"
							class="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-raised"
						>
							<Avatar name={comment.authorName} size={7} />
							<div class="min-w-0 flex-1">
								<p class="text-xs text-muted">
									<span class="font-medium text-ink">{comment.authorName}</span>
									on <span class="font-medium text-ink">{comment.projectName}</span>
								</p>
								<p class="mt-1 truncate text-[13px] text-body">{comment.body}</p>
								<p class="mt-1 text-[11px] text-faint">{formatDateTime(comment.createdAt)}</p>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		</Section>
	{/if}

	{#if showOnboarding}
		<div class="rounded-lg border border-accent/25 bg-accent-soft px-6 py-5">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-[13px] font-medium text-ink">Finish setting up</p>
					<p class="mt-1 text-xs text-body">Four small steps and the workspace is ready for clients.</p>
				</div>
				<button
					type="button"
					onclick={dismissOnboarding}
					class="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-accent/10 hover:text-ink"
					aria-label="Dismiss checklist"
				>
					<IconXRegular class="h-4 w-4" />
				</button>
			</div>
			<ul class="mt-4 grid gap-2 sm:grid-cols-2">
				{#each steps as step (step.label)}
					<li>
						<a
							href={step.href}
							class="flex items-center gap-2.5 rounded-md bg-surface/70 px-3 py-2.5 transition-colors hover:bg-surface"
						>
							<span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full {step.done ? 'bg-accent text-page' : 'border border-line-strong text-transparent'}">
								<IconCheckBold class="h-3 w-3" />
							</span>
							<span class="text-xs {step.done ? 'text-faint line-through' : 'text-body'}">
								{step.label}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
		<Stat label="Active projects" value={data.active} />
		<Stat label="In review" value={data.pending} tone={data.pending > 0 ? 'warning' : 'default'} />
		<Stat label="Completed" value={data.completed} />
		<Stat label="Revenue" value={formatMoney(data.revenue)} tone="accent" />
	</div>

	<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
		<Section title="Active projects" flush>
			{#if data.projects.length === 0}
				<EmptyState
					icon={IconFolderOpenRegular}
					title="No projects yet"
					description="Create your first project and invite a client."
					action={{ label: 'Create project', href: '/dashboard/projects?new=1' }}
				/>
			{:else}
				<ul class="divide-y divide-line">
					{#each data.projects as project (project.id)}
						{@const overdue = project.dueDate !== null && project.dueDate < todayISO() && project.status !== 'completed'}
						<li>
							<a
								href="/dashboard/projects/{project.id}"
								class="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-raised"
							>
								<Avatar name={project.name} size={8} />
								<div class="min-w-0 flex-1">
									<p class="truncate text-[13px] font-medium text-ink">{project.name}</p>
									<p class="mt-0.5 text-[11px] {overdue ? 'text-danger' : 'text-muted'}">
										{project.dueDate ? `Due ${formatDate(project.dueDate)}` : 'No due date'}
									</p>
								</div>
								<Badge tone={PROJECT_STATUS_TONE[project.status]}>
									{PROJECT_STATUS_LABEL[project.status]}
								</Badge>
								<IconArrowRightRegular class="h-3.5 w-3.5 shrink-0 text-faint" />
							</a>
						</li>
					{/each}
				</ul>
				<div class="border-t border-line px-6 py-2.5">
					<a
						href="/dashboard/projects"
						class="inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
					>
						View all projects
						<IconArrowRightRegular class="h-3 w-3" />
					</a>
				</div>
			{/if}
		</Section>

		<Section title="Recent activity" flush>
			{#if data.activity.length === 0}
				<p class="px-6 py-5 text-[13px] text-muted">
					Comments from clients will show up here.
				</p>
			{:else}
				<ul class="divide-y divide-line">
					{#each data.activity as item (item.id)}
						<li class="flex items-start gap-2.5 px-6 py-4">
							<Avatar name={item.authorName} size={6} />
							<div class="min-w-0 flex-1">
								<p class="text-[11px] text-muted">
									<span class="font-medium text-ink">{item.authorName}</span>
									on {item.projectName}
								</p>
								<p class="mt-1 truncate text-[13px] text-body">{item.body}</p>
								<p class="mt-1 text-[11px] text-faint">{formatDateTime(item.createdAt)}</p>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</Section>
	</div>
</div>
