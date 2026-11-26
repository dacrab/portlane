<script lang="ts">
import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte'
import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte'
import ProjectWorkspace from '#lib/components/ProjectWorkspace.svelte'
import { formatDate } from '#lib/domain/format.js'
import {
	PROJECT_STATUS_LABEL,
	PROJECT_STATUS_TONE,
} from '#lib/domain/status.js'
import Avatar from '#lib/ui/Avatar.svelte'
import Badge from '#lib/ui/Badge.svelte'
import EmptyState from '#lib/ui/EmptyState.svelte'
import PageHeader from '#lib/ui/PageHeader.svelte'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()
</script>

{#if data.project}
	<ProjectWorkspace
		project={data.project}
		milestones={data.milestones}
		files={data.files}
		comments={data.comments}
		invoices={data.invoices}
		role="client"
		currentUserId={data.user?.userId ?? ''}
	/>
{:else}
	<PageHeader
		title="Your projects"
		description="Everything shared with you, in one place."
	/>

	<div class="mt-8">
		{#if data.projects.length === 0}
			<div class="rounded-lg border border-line bg-surface">
				<EmptyState
					icon={IconFolderOpenRegular}
					title="Nothing here yet"
					description="Your freelancer hasn't added you to a project yet."
				/>
			</div>
		{:else}
			<ul class="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
				{#each data.projects as project (project.id)}
					<li>
						<a
							href="/portal?project={project.id}"
							class="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-raised"
						>
							<Avatar name={project.name} size={9} />
							<div class="min-w-0 flex-1">
								<p class="truncate text-[13px] font-medium text-ink">{project.name}</p>
								<p class="mt-0.5 text-xs text-muted">
									{#if project.freelancerName}Managed by {project.freelancerName}{/if}
									{#if project.dueDate}
										{#if project.freelancerName} · {/if}Due {formatDate(project.dueDate)}
									{/if}
								</p>
							</div>
							<Badge tone={PROJECT_STATUS_TONE[project.status]}>
								{PROJECT_STATUS_LABEL[project.status]}
							</Badge>
							<IconArrowRightRegular class="h-4 w-4 shrink-0 text-faint" />
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
