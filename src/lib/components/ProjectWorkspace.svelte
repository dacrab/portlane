<script lang="ts">
import IconArrowCounterClockwiseRegular from 'phosphor-icons-svelte/IconArrowCounterClockwiseRegular.svelte'
import IconArrowLeftRegular from 'phosphor-icons-svelte/IconArrowLeftRegular.svelte'
import IconCheckCircleFill from 'phosphor-icons-svelte/IconCheckCircleFill.svelte'
import IconCircleRegular from 'phosphor-icons-svelte/IconCircleRegular.svelte'
import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte'
import IconDownloadSimpleRegular from 'phosphor-icons-svelte/IconDownloadSimpleRegular.svelte'
import IconExportRegular from 'phosphor-icons-svelte/IconExportRegular.svelte'
import IconLinkRegular from 'phosphor-icons-svelte/IconLinkRegular.svelte'
import IconPaperclipRegular from 'phosphor-icons-svelte/IconPaperclipRegular.svelte'
import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte'
import IconThumbsUpRegular from 'phosphor-icons-svelte/IconThumbsUpRegular.svelte'
import IconTrashRegular from 'phosphor-icons-svelte/IconTrashRegular.svelte'
import IconUserPlusRegular from 'phosphor-icons-svelte/IconUserPlusRegular.svelte'
import { untrack } from 'svelte'
import { toast } from 'svelte-sonner'
import { downloadFile } from '#lib/client/download.js'
import {
	checkoutEnhance,
	submitForm,
	submitOnFilePick,
	toastEnhance,
} from '#lib/client/enhance.js'
import {
	formatDate,
	formatDateLong,
	formatDateTime,
	formatFileSize,
	formatMoney,
	todayISO,
} from '#lib/domain/format.js'
import {
	INVOICE_STATUS_LABEL,
	INVOICE_STATUS_TONE,
	PROJECT_STATUS_ITEMS,
	PROJECT_STATUS_LABEL,
	PROJECT_STATUS_TONE,
} from '#lib/domain/status.js'
import type {
	Invoice,
	Milestone,
	Project,
	ProjectClient,
	ProjectComment,
	ProjectFile,
	TimeEntry,
} from '#lib/domain/types.js'
import { asRecord } from '#lib/records.js'
import Avatar from '#lib/ui/Avatar.svelte'
import Badge from '#lib/ui/Badge.svelte'
import Button from '#lib/ui/Button.svelte'
import { confirmDeleteFromEvent } from '#lib/ui/confirm.js'
import IconButton from '#lib/ui/IconButton.svelte'
import Input from '#lib/ui/Input.svelte'
import Progress from '#lib/ui/Progress.svelte'
import Section from '#lib/ui/Section.svelte'
import Select from '#lib/ui/Select.svelte'
import Spinner from '#lib/ui/Spinner.svelte'
import Textarea from '#lib/ui/Textarea.svelte'
import { enhance } from '$app/forms'

let {
	project,
	milestones,
	files,
	comments,
	invoices = [],
	clients = [],
	timeEntries = [],
	note = '',
	role,
	currentUserId,
}: {
	project: Project
	milestones: Milestone[]
	files: ProjectFile[]
	comments: ProjectComment[]
	invoices?: Invoice[]
	clients?: ProjectClient[]
	timeEntries?: TimeEntry[]
	note?: string
	role: 'owner' | 'client'
	currentUserId: string
} = $props()

const isOwner = $derived(role === 'owner')
const done = $derived(milestones.filter((m) => m.completed).length)
const total = $derived(milestones.length)
const totalMinutes = $derived(
	timeEntries.reduce((sum, entry) => sum + entry.minutes, 0),
)
const totalHours = $derived((totalMinutes / 60).toFixed(1))

let projectStatus = $state(untrack(() => project.status))
$effect(() => {
	projectStatus = project.status
})

let comment = $state('')
let milestoneName = $state('')
let inviteEmail = $state('')
let inviting = $state(false)
let demoInvite = $state<{ email: string; password: string } | null>(null)
let minutes = $state('')
let timeDescription = $state('')
let noteBody = $state(untrack(() => note))
let approvalNote = $state('')

function copyPortalLink() {
	navigator.clipboard.writeText(
		`${window.location.origin}/portal?project=${project.id}`,
	)
	toast.success('Portal link copied')
}

function copyDemoInvite() {
	if (!demoInvite) return
	navigator.clipboard.writeText(`${demoInvite.email} / ${demoInvite.password}`)
	toast.success('Demo login copied')
}

function exportTime() {
	const rows = [
		['Date', 'Description', 'Minutes', 'Hours'],
		...timeEntries.map((entry) => [
			entry.loggedAt,
			entry.description ?? '',
			entry.minutes,
			(entry.minutes / 60).toFixed(2),
		]),
		['', 'Total', totalMinutes, (totalMinutes / 60).toFixed(2)],
	]
	const csv = rows
		.map((row) =>
			row
				.map(String)
				.map((value) => `"${value.replace(/"/g, '""')}"`)
				.join(','),
		)
		.join('\n')
	const blob = new Blob([csv], { type: 'text/csv' })
	const link = document.createElement('a')
	link.href = URL.createObjectURL(blob)
	link.download = `${project.name}-time.csv`
	link.click()
	URL.revokeObjectURL(link.href)
	toast.success('Time entries exported')
}
</script>

<header class="flex flex-wrap items-start justify-between gap-6">
	<div class="min-w-0">
		<a
			href={isOwner ? '/dashboard/projects' : '/portal'}
			class="mb-4 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
		>
			<IconArrowLeftRegular class="h-3.5 w-3.5" />
			{isOwner ? 'All projects' : 'All projects'}
		</a>

		<div class="flex flex-wrap items-center gap-3">
			<h1 class="display text-[32px] leading-none">{project.name}</h1>
			<Badge tone={PROJECT_STATUS_TONE[project.status]}>
				{PROJECT_STATUS_LABEL[project.status]}
			</Badge>
		</div>

		{#if project.description}
			<p class="mt-3 max-w-2xl text-[13px] leading-relaxed text-body">
				{project.description}
			</p>
		{/if}

		<div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted">
			{#if project.dueDate}
				<span class={project.dueDate < todayISO() && project.status !== 'completed' ? 'text-danger' : ''}>
					Due {formatDateLong(project.dueDate)}
				</span>
			{/if}
			{#if total > 0}
				<span>{done} of {total} milestones</span>
			{/if}
			{#if isOwner}
				<span>{totalHours} h logged</span>
			{/if}
			{#if !isOwner && project.freelancerName}
				<span>Managed by {project.freelancerName}</span>
			{/if}
		</div>
	</div>

	<div class="flex shrink-0 flex-wrap items-center gap-2">
		{#if isOwner}
			<form
				id="status-form"
				method="POST"
				action="?/update_status"
				use:enhance={toastEnhance({ successMsg: 'Status updated' })}
			>
				<input type="hidden" name="status" value={projectStatus} />
				<div class="w-36">
					<Select
						bind:value={projectStatus}
						items={PROJECT_STATUS_ITEMS}
						onchange={() => submitForm('status-form')}
					/>
				</div>
			</form>
			<Button variant="secondary" size="sm" onclick={copyPortalLink}>
				<IconLinkRegular class="h-3.5 w-3.5" />
				Portal link
			</Button>
			<form id="delete-project-form" method="POST" action="?/delete_project" use:enhance={toastEnhance()}>
				<IconButton
					label="Delete project"
					onclick={(event: MouseEvent) =>
						confirmDeleteFromEvent(
							'This permanently deletes the project and everything in it.',
							event,
						)}
				>
					<IconTrashRegular class="h-4 w-4" />
				</IconButton>
			</form>
		{/if}
	</div>
</header>

{#if total > 0}
	<Progress current={done} {total} label="Milestones complete" />
{/if}

<div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
	<div class="space-y-6">
		<Section title="Milestones" meta={total > 0 ? `${done}/${total} done` : undefined} flush>
			{#if milestones.length === 0}
				<p class="px-6 py-5 text-[13px] text-muted">
					No milestones yet. {isOwner ? 'Add the first one below.' : 'Your freelancer will add these as the work is planned.'}
				</p>
			{:else}
				<ul class="divide-y divide-line">
					{#each milestones as milestone, index (milestone.id)}
						<li class="flex items-center gap-3 px-6 py-3">
							{#if isOwner}
								<form method="POST" action="?/toggle_milestone" use:enhance={toastEnhance()}>
									<input type="hidden" name="id" value={milestone.id} />
									<input type="hidden" name="completed" value={milestone.completed} />
									<button type="submit" class="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-raised" aria-label={milestone.completed ? 'Mark incomplete' : 'Mark complete'}>
										{#if milestone.completed}
											<IconCheckCircleFill class="h-4 w-4 text-accent" />
										{:else}
											<IconCircleRegular class="h-4 w-4 text-faint" />
										{/if}
									</button>
								</form>
							{:else}
								<span class="flex h-5 w-5 items-center justify-center">
									{#if milestone.completed}
										<IconCheckCircleFill class="h-4 w-4 text-accent" />
									{:else}
										<IconCircleRegular class="h-4 w-4 text-faint" />
									{/if}
								</span>
							{/if}

							<span
								class="flex-1 text-[13px] {milestone.completed ? 'text-faint line-through' : 'text-body'}"
							>
								{milestone.name}
							</span>

							{#if !isOwner && !milestone.completed && milestones[index - 1]?.completed}
								<span class="flex items-center gap-1 text-[11px] font-medium text-accent">
									<IconClockRegular class="h-3 w-3" />
									Up next
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			{#if isOwner}
				<form
					method="POST"
					action="?/add_milestone"
					use:enhance={toastEnhance({
						successMsg: 'Milestone added',
						beforeUpdate: () => {
							milestoneName = ''
						},
					})}
					class="flex gap-2 border-t border-line px-6 py-3"
				>
					<Input name="name" bind:value={milestoneName} required placeholder="Add a milestone" />
					<Button type="submit" size="sm" class="shrink-0" aria-label="Add milestone">
						<IconPlusRegular class="h-4 w-4" />
					</Button>
				</form>
			{/if}
		</Section>

		{#if isOwner}
			<Section title="Time" meta={`${totalHours} h`} flush>
				{#if timeEntries.length === 0}
					<p class="px-6 py-5 text-[13px] text-muted">No time logged yet.</p>
				{:else}
					<ul class="divide-y divide-line">
						{#each timeEntries as entry (entry.id)}
							<li class="flex items-center gap-3 px-6 py-2.5">
								<IconClockRegular class="h-3.5 w-3.5 shrink-0 text-faint" />
								<span class="flex-1 truncate text-[13px] text-body">
									{entry.description ?? 'No description'}
								</span>
								<span class="tabular text-xs text-muted">{formatDate(entry.loggedAt)}</span>
								<span class="w-12 text-right tabular text-xs font-medium text-ink">
									{(entry.minutes / 60).toFixed(1)} h
								</span>
							</li>
						{/each}
					</ul>
				{/if}

				<form
					method="POST"
					action="?/log_time"
					use:enhance={toastEnhance({
						successMsg: 'Time logged',
						beforeUpdate: () => {
							minutes = ''
							timeDescription = ''
						},
					})}
					class="flex gap-2 border-t border-line px-6 py-3"
				>
					<div class="min-w-0 flex-1">
						<Input name="description" bind:value={timeDescription} placeholder="What did you work on?" />
					</div>
					<div class="w-20 shrink-0">
						<Input name="minutes" bind:value={minutes} type="number" min="1" required placeholder="min" />
					</div>
					<Button type="submit" size="sm" class="shrink-0" aria-label="Log time">
						<IconPlusRegular class="h-4 w-4" />
					</Button>
				</form>

				{#if timeEntries.length > 0}
					<div class="border-t border-line px-6 py-2.5">
						<Button variant="ghost" size="sm" onclick={exportTime}>
							<IconExportRegular class="h-3.5 w-3.5" />
							Export CSV
						</Button>
					</div>
				{/if}
			</Section>
		{/if}

		<Section title={isOwner ? 'Comments' : 'Messages'} meta={comments.length > 0 ? String(comments.length) : undefined} flush>
			{#if comments.length === 0}
				<p class="px-6 py-5 text-[13px] text-muted">
					{isOwner ? 'No comments yet. Start the thread below.' : 'No messages yet. Ask a question below.'}
				</p>
			{:else}
				<ul class="max-h-96 space-y-4 overflow-y-auto px-6 py-5 scroll-thin">
					{#each comments as item (item.id)}
						{@const mine = item.authorId === currentUserId}
						<li class="flex items-start gap-3 {mine ? 'flex-row-reverse' : ''}">
							<Avatar name={item.name} size={7} />
							<div class="max-w-[85%] {mine ? 'text-right' : ''}">
								<p class="mb-1 text-[11px] text-faint">
									{item.name} · {formatDateTime(item.createdAt)}
								</p>
								<div class="inline-block rounded-md px-3 py-2 text-left text-[13px] {mine ? 'bg-accent/10 text-ink' : 'bg-raised text-body'}">
									{item.body}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}

			<form
				method="POST"
				action="?/comment"
				use:enhance={toastEnhance({
					successMsg: 'Comment posted',
					beforeUpdate: () => {
						comment = ''
					},
				})}
				class="flex gap-2 border-t border-line px-6 py-3"
			>
				<Input name="body" bind:value={comment} required placeholder={isOwner ? 'Write a comment' : 'Write a message'} />
				<Button type="submit" size="sm" class="shrink-0">Send</Button>
			</form>
		</Section>
	</div>

	<div class="space-y-6">
		{#if invoices.length > 0}
			<Section title="Invoices" flush>
				<ul class="divide-y divide-line">
					{#each invoices as invoice (invoice.id)}
						{@const overdue = invoice.dueDate !== null && invoice.dueDate < todayISO() && invoice.status !== 'paid'}
						{@const payable = !isOwner && (invoice.status === 'sent' || invoice.status === 'overdue') && !invoice.stripeSessionId}
						<li class="flex items-center gap-3 px-6 py-3.5">
							<div class="min-w-0 flex-1">
								<p class="tabular text-[13px] font-medium text-ink">
									{formatMoney(invoice.amountCents, invoice.currency)}
								</p>
								<p class="mt-0.5 text-[11px] {overdue ? 'text-danger' : 'text-muted'}">
									{invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : `Issued ${formatDate(invoice.createdAt)}`}
								</p>
							</div>

							{#if payable}
								<form method="POST" action="?/checkout" use:enhance={checkoutEnhance()}>
									<input type="hidden" name="invoiceId" value={invoice.id} />
									<Button type="submit" size="sm">Pay</Button>
								</form>
							{:else}
								<Badge tone={INVOICE_STATUS_TONE[invoice.status]}>
									{INVOICE_STATUS_LABEL[invoice.status]}
								</Badge>
							{/if}
						</li>
					{/each}
				</ul>
			</Section>
		{/if}

		<Section title="Files" meta={files.length > 0 ? String(files.length) : undefined} flush>
			{#if files.length === 0}
				<p class="px-6 py-5 text-[13px] text-muted">No files yet.</p>
			{:else}
				<ul class="divide-y divide-line">
					{#each files as file (file.id)}
						<li class="flex items-center gap-3 px-6 py-3">
							<IconPaperclipRegular class="h-3.5 w-3.5 shrink-0 text-faint" />
							<div class="min-w-0 flex-1">
								<p class="truncate text-[13px] font-medium text-body">{file.name}</p>
								<p class="mt-0.5 text-[11px] text-muted">
									{formatFileSize(file.sizeBytes)} · {formatDate(file.createdAt)}
								</p>
							</div>
							<IconButton label="Download {file.name}" onclick={() => downloadFile(file.storagePath, file.name)}>
								<IconDownloadSimpleRegular class="h-4 w-4" />
							</IconButton>
							{#if isOwner}
								<form method="POST" action="?/delete_file" use:enhance={toastEnhance()}>
									<input type="hidden" name="id" value={file.id} />
									<IconButton
										label="Delete {file.name}"
										onclick={(event: MouseEvent) =>
											confirmDeleteFromEvent(`Delete "${file.name}"?`, event)}
									>
										<IconTrashRegular class="h-4 w-4" />
									</IconButton>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			<form
				method="POST"
				action="?/upload_file"
				enctype="multipart/form-data"
				use:enhance={toastEnhance({ successMsg: 'File uploaded' })}
				class="border-t border-line px-6 py-3"
			>
				<label class="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-hover">
					<IconPlusRegular class="h-3.5 w-3.5" />
					Upload a file
					<input type="file" name="file" class="hidden" onchange={submitOnFilePick} />
				</label>
			</form>
		</Section>

		{#if isOwner}
			<Section title="Clients" flush>
				{#if clients.length === 0}
					<p class="px-6 py-5 text-[13px] text-muted">No clients on this project yet.</p>
				{:else}
					<ul class="divide-y divide-line">
						{#each clients as client (client.id)}
							<li class="flex items-center gap-3 px-6 py-3">
								<Avatar name={client.name} size={7} />
								<span class="min-w-0 flex-1 truncate text-[13px] text-body">{client.name}</span>
								<form method="POST" action="?/remove_client" use:enhance={toastEnhance()}>
									<input type="hidden" name="client_id" value={client.id} />
									<IconButton
										label="Remove {client.name}"
										onclick={(event: MouseEvent) =>
											confirmDeleteFromEvent(`Remove ${client.name} from this project?`, event)}
									>
										<IconTrashRegular class="h-4 w-4" />
									</IconButton>
								</form>
							</li>
						{/each}
					</ul>
				{/if}

				<form
					method="POST"
					action="?/invite_client"
					use:enhance={() => {
						inviting = true
						return async ({ result, update }) => {
							inviting = false
							const invitedEmail = inviteEmail
							inviteEmail = ''
							await update()
							if (result.type === 'failure') {
								const message = asRecord(result.data)?.error
								toast.error(typeof message === 'string' ? message : 'Invitation failed')
							} else if (result.type === 'error') {
								toast.error('Something went wrong')
							} else {
								const tempPassword =
									result.type === 'success'
										? asRecord(result.data)?.tempPassword
										: undefined
								if (typeof tempPassword === 'string') {
									demoInvite = { email: invitedEmail, password: tempPassword }
									toast.success('Client added', {
										description: 'Share the demo password shown below.',
									})
								} else {
									toast.success('Client added', {
										description: 'They can sign in to the portal with this email.',
									})
								}
							}
						}
					}}
					class="flex gap-2 border-t border-line px-6 py-3"
				>
					<Input name="email" type="email" bind:value={inviteEmail} required placeholder="client@email.com" disabled={inviting} />
					<Button type="submit" size="sm" class="shrink-0" disabled={inviting} aria-label="Invite client">
						{#if inviting}
							<Spinner />
						{:else}
							<IconUserPlusRegular class="h-4 w-4" />
						{/if}
					</Button>
				</form>

				{#if demoInvite}
					<div class="border-t border-line bg-raised px-6 py-3">
						<p class="text-xs font-medium text-ink">
							Demo login for {demoInvite.email}
						</p>
						<div class="mt-2 flex items-center gap-2">
							<code class="min-w-0 flex-1 truncate rounded bg-surface px-2 py-1 font-mono text-xs text-body">
								{demoInvite.password}
							</code>
							<Button size="sm" variant="secondary" onclick={copyDemoInvite}>
								Copy
							</Button>
							<Button size="sm" variant="ghost" onclick={() => (demoInvite = null)}>
								Dismiss
							</Button>
						</div>
					</div>
				{/if}
			</Section>

			<Section title="Private notes">
				<form
					method="POST"
					action="?/save_note"
					use:enhance={toastEnhance({ successMsg: 'Note saved' })}
					class="space-y-3"
				>
					<Textarea name="body" bind:value={noteBody} rows="5" placeholder="Only you can see this." />
					<Button type="submit" variant="secondary" size="sm">Save note</Button>
				</form>
			</Section>
		{/if}

		{#if !isOwner}
			<Section title="Approval">
				<p class="text-[13px] leading-relaxed text-muted">
					Approve the work, or ask for a change. Your note is posted to the project thread.
				</p>
				<form
					method="POST"
					action="?/approve"
					use:enhance={toastEnhance({
						successMsg: 'Response sent',
						beforeUpdate: () => {
							approvalNote = ''
						},
					})}
					class="mt-4 space-y-3"
				>
					<Textarea bind:value={approvalNote} name="note" rows="3" placeholder="Optional note" />
					<div class="flex flex-wrap gap-2">
						<Button type="submit" size="sm">
							<IconThumbsUpRegular class="h-3.5 w-3.5" />
							Approve
						</Button>
						<Button
							type="submit"
							variant="ghost"
							size="sm"
							formaction="?/request_revision"
						>
							<IconArrowCounterClockwiseRegular class="h-3.5 w-3.5" />
							Request a revision
						</Button>
					</div>
				</form>
			</Section>
		{/if}
	</div>
</div>
