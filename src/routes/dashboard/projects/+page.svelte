<script lang="ts">
import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte'
import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte'
import { formatDate, todayISO } from '#lib/domain/format.js'
import {
	PROJECT_STATUS_ITEMS,
	PROJECT_STATUS_LABEL,
	PROJECT_STATUS_TONE,
} from '#lib/domain/status.js'
import Avatar from '#lib/ui/Avatar.svelte'
import Badge from '#lib/ui/Badge.svelte'
import Button from '#lib/ui/Button.svelte'
import DatePicker from '#lib/ui/DatePicker.svelte'
import EmptyState from '#lib/ui/EmptyState.svelte'
import Field from '#lib/ui/Field.svelte'
import Input from '#lib/ui/Input.svelte'
import PageHeader from '#lib/ui/PageHeader.svelte'
import Select from '#lib/ui/Select.svelte'
import SlideOver from '#lib/ui/SlideOver.svelte'
import Textarea from '#lib/ui/Textarea.svelte'
import { enhance } from '$app/forms'
import { page } from '$app/state'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()

let open = $state(page.url.searchParams.has('new'))
let showArchived = $state(false)
let creating = $state(false)

const createStatusItems = PROJECT_STATUS_ITEMS.filter(
	(status) => status.value === 'planning' || status.value === 'in_progress',
)

const items = $derived(data.projects)
const visible = $derived(
	showArchived
		? items
		: items.filter((project) => project.status !== 'archived'),
)
const archivedCount = $derived(
	items.filter((project) => project.status === 'archived').length,
)
const activeCount = $derived(
	items.filter((project) => !['completed', 'archived'].includes(project.status))
		.length,
)
const reviewCount = $derived(
	items.filter((project) => project.status === 'review').length,
)

function progress(project: (typeof items)[number]) {
	return project.totalMilestones > 0
		? Math.round((project.completedMilestones / project.totalMilestones) * 100)
		: null
}
</script>

<SlideOver bind:open title="New project" description="Set up the basics. You can invite a client now or later.">
	<form
		method="POST"
		action="?/create"
		use:enhance={() => {
			creating = true
			return async ({ update }) => {
				creating = false
				await update()
			}
		}}
		class="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6"
	>
		<Field label="Project name" for="project-name">
			<Input id="project-name" name="name" required placeholder="Brand redesign" />
		</Field>

		<Field label="Description" for="project-description" optional>
			<Textarea
				id="project-description"
				name="description"
				rows="3"
				placeholder="Scope, goals, anything worth remembering."
			/>
		</Field>

		<div class="grid gap-4 sm:grid-cols-2">
			<Field label="Due date">
				<DatePicker name="due_date" placeholder="Pick a date" />
			</Field>
			<Field label="Status">
				<Select name="status" value="planning" items={createStatusItems} />
			</Field>
		</div>

		<div class="mt-auto flex gap-3 border-t border-line pt-5">
			<Button type="submit" disabled={creating} class="flex-1">
				{creating ? 'Creating…' : 'Create project'}
			</Button>
			<Button type="button" variant="ghost" onclick={() => (open = false)}>
				Cancel
			</Button>
		</div>
	</form>
</SlideOver>

<div class="space-y-8">
	<PageHeader
		title="Projects"
		description="{visible.length} shown · {activeCount} active · {reviewCount} in review"
	>
		{#snippet actions()}
			{#if archivedCount > 0}
				<Button variant="ghost" size="sm" onclick={() => (showArchived = !showArchived)}>
					{showArchived ? 'Hide archived' : `Archived (${archivedCount})`}
				</Button>
			{/if}
			<Button size="sm" onclick={() => (open = true)}>
				<IconPlusRegular class="h-4 w-4" />
				New project
			</Button>
		{/snippet}
	</PageHeader>

	<div class="overflow-hidden rounded-lg border border-line bg-surface">
		{#if visible.length === 0}
			<EmptyState
				icon={IconFolderOpenRegular}
				title="No projects yet"
				description="Create a project and invite your first client."
				action={{ label: 'Create project', onClick: () => (open = true) }}
			/>
		{:else}
			<div class="hidden items-center gap-4 border-b border-line px-6 py-2.5 text-[11px] font-medium text-faint sm:grid sm:grid-cols-[minmax(0,1fr)_8rem_4rem_6rem]">
				<span>Project</span>
				<span>Progress</span>
				<span class="text-center">Clients</span>
				<span class="text-right">Status</span>
			</div>

			<ul class="divide-y divide-line">
				{#each visible as project (project.id)}
					{@const pct = progress(project)}
					{@const overdue = project.dueDate !== null && project.dueDate < todayISO() && project.status !== 'completed'}
					<li>
						<a
							href="/dashboard/projects/{project.id}"
							class="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-raised"
						>
							<div class="flex min-w-0 flex-1 items-center gap-3">
								<Avatar name={project.name} size={8} />
								<div class="min-w-0">
									<p class="truncate text-[13px] font-medium text-ink">{project.name}</p>
									<p class="mt-0.5 text-[11px] {overdue ? 'text-danger' : 'text-muted'}">
										{project.dueDate ? `Due ${formatDate(project.dueDate)}` : 'No due date'}
									</p>
								</div>
							</div>

							<div class="hidden w-32 shrink-0 items-center gap-2 sm:flex">
								{#if pct !== null}
									<div class="h-1 flex-1 overflow-hidden rounded-xs bg-raised">
										<div class="h-full bg-accent" style="width:{pct}%"></div>
									</div>
									<span class="w-8 text-right tabular text-[11px] text-muted">{pct}%</span>
								{:else}
									<span class="text-[11px] text-faint">—</span>
								{/if}
							</div>

							<div class="hidden w-16 shrink-0 text-center sm:block">
								<span class="tabular text-xs text-muted">{project.clientCount}</span>
							</div>

							<div class="flex w-24 shrink-0 justify-end">
								<Badge tone={PROJECT_STATUS_TONE[project.status]}>
									{PROJECT_STATUS_LABEL[project.status]}
								</Badge>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
