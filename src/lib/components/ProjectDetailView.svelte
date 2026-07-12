<script lang="ts">
import IconArrowCounterClockwiseRegular from 'phosphor-icons-svelte/IconArrowCounterClockwiseRegular.svelte'
import IconCheckCircleBold from 'phosphor-icons-svelte/IconCheckCircleBold.svelte'
import IconCircleRegular from 'phosphor-icons-svelte/IconCircleRegular.svelte'
import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte'
import IconDownloadSimpleRegular from 'phosphor-icons-svelte/IconDownloadSimpleRegular.svelte'
import IconFileRegular from 'phosphor-icons-svelte/IconFileRegular.svelte'
import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte'
import IconThumbsUpRegular from 'phosphor-icons-svelte/IconThumbsUpRegular.svelte'
import { toast } from 'svelte-sonner'
import { enhance } from '$app/forms'
import { downloadFile } from '$lib/client/download'
import { toastEnhance } from '$lib/client/enhance'
import CommentThread from '$lib/components/CommentThread.svelte'
import ProgressBar from '$lib/components/ProgressBar.svelte'
import SectionHeader from '$lib/components/SectionHeader.svelte'
import { fmtDate, fmtMoney, statusBadge, today } from '$lib/fmt'
import { milestoneDone, milestoneTotal } from '$lib/milestones'
import type { PageData } from '../../routes/portal/$types'

type WithProfile = { profiles: { full_name: string | null } | null }

let {
	data,
}: {
	data: Omit<PageData, 'project'> & {
		project: NonNullable<PageData['project']>
	}
} = $props()
let comment = $state('')
let note = $state('')
let submittingApproval = $state(false)

const freelancerName = $derived(
	(data.project as WithProfile | null)?.profiles?.full_name ??
		'Your freelancer',
)
const total = $derived(milestoneTotal(data.milestones))
const done = $derived(milestoneDone(data.milestones))
const isClient = $derived(data.invoices.length > 0)
</script>

<!-- Project detail: two-column -->
<div class="grid grid-cols-[1fr_22rem] gap-6 items-start max-md:grid-cols-1">

	<!-- Left -->
	<div class="flex flex-col space-y-5">

		<!-- Hero -->
		<div class="card">
			<div class="flex items-start justify-between gap-4 mb-4">
				<div>
					<p class="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Project</p>
					<h1 class="text-xl font-bold tracking-tight text-heading">{data.project.name}</h1>
					<p class="mt-0.5 text-sm text-faint">Managed by {freelancerName}</p>
				</div>
				<span class="badge badge-accent shrink-0 mt-1">{data.project.status.replace('_', ' ')}</span>
			</div>
			{#if total > 0}
				<ProgressBar current={done} {total} />
			{/if}
		</div>

		<!-- Timeline -->
		{#if data.milestones.length > 0}
			<div class="card">
				<SectionHeader title="Timeline" />
				<div class="space-y-1">
					{#each data.milestones as m, i}
						<div class="flex items-center gap-3 rounded-lg px-2 py-2">
							{#if m.completed}
								<span class="text-accent shrink-0"><IconCheckCircleBold class="h-4 w-4" /></span>
							{:else}
								<span class="shrink-0" style="color:var(--color-border)"><IconCircleRegular class="h-4 w-4" /></span>
							{/if}
							<span class="flex-1 text-sm" style="{m.completed ? 'color:var(--color-text-faint);text-decoration:line-through' : 'color:var(--color-text)'}">{m.name}</span>
							{#if !m.completed && data.milestones[i - 1]?.completed}
								<span class="text-xs font-medium text-accent flex items-center gap-1 shrink-0">
									<IconClockRegular class="h-3 w-3" /> Up next
								</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Invoices -->
		{#if data.invoices.length > 0}
			<div class="card">
				<SectionHeader title="Invoices" />
				<div class="space-y-2">
					{#each data.invoices as inv}
						<div class="relative flex items-center justify-between rounded-lg px-3 py-3" style="border:1px solid var(--color-border-subtle)">
							{#if isClient && (inv.status === 'sent' || inv.status === 'overdue') && !inv.stripe_session_id}
								<form method="POST" action="?/checkout" use:enhance={() => {
									return async ({ result }) => {
										if (result.type !== 'success') return;
										const data = result.data as { url?: string } | undefined;
										if (data?.url) window.location.href = data.url;
									};
									}}
									class="absolute inset-0 z-10 cursor-pointer" style="background:transparent">
									<input type="hidden" name="invoiceId" value={inv.id} />
								</form>
							{/if}
							<div>
								<p class="text-sm font-semibold text-heading">{fmtMoney(inv.amount_cents)}</p>
								<p class="text-xs mt-0.5" class:text-danger={inv.due_date && inv.due_date < today() && inv.status !== 'paid'} class:text-faint={!(inv.due_date && inv.due_date < today() && inv.status !== 'paid')}>
									{inv.due_date ? `Due ${fmtDate(inv.due_date)}` : fmtDate(inv.created_at ?? '')}
								</p>
							</div>
							<span class="{statusBadge[inv.status] ?? 'badge badge-neutral'}">{inv.status}</span>
							{#if inv.status === 'paid'}
								<span class="text-xs font-medium text-success ml-2">Paid</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Approval -->
		<div class="card">
			<SectionHeader title="Review &amp; Approval" />
			<p class="mb-3 text-sm text-muted">Approve the work or request changes.</p>
			<textarea bind:value={note} placeholder="Optional note for your freelancer…" rows="2" class="input mb-3 resize-none"></textarea>
			<div class="flex gap-2">
				<form method="POST" action="?/approve" use:enhance={() => {
					submittingApproval = true;
					return async ({ update }) => { submittingApproval = false; note = ''; await update(); toast.success('Work approved!'); };
				}}>
					<input type="hidden" name="note" value={note} />
					<button type="submit" class="btn btn-primary" disabled={submittingApproval}>
						<IconThumbsUpRegular class="h-3.5 w-3.5" /> Approve
					</button>
				</form>
				<form method="POST" action="?/request_revision" use:enhance={() => {
					submittingApproval = true;
					return async ({ update }) => { submittingApproval = false; note = ''; await update(); toast.info('Revision requested'); };
				}}>
					<input type="hidden" name="note" value={note} />
					<button type="submit" class="btn btn-ghost" disabled={submittingApproval}>
						<IconArrowCounterClockwiseRegular class="h-3.5 w-3.5" /> Request revision
					</button>
				</form>
			</div>
		</div>
	</div>

	<!-- Right -->
	<div class="flex flex-col space-y-5">

		<!-- Files -->
		<div class="card">
			<SectionHeader title="Files" />
			{#if data.files.length === 0}
				<div class="flex flex-col items-center py-8 text-center">
					<span class="text-faint mb-2"><IconFileRegular class="h-7 w-7" /></span>
					<p class="text-sm text-faint">No files yet.</p>
				</div>
			{:else}
				<div class="space-y-2 mb-4">
					{#each data.files as f}
						<div class="flex items-center gap-3 rounded-lg px-3 py-2.5" style="border:1px solid var(--color-border-subtle)">
							<div class="flex-1 min-w-0">
								<p class="truncate text-sm font-medium text-body">{f.name}</p>
								<p class="text-xs text-faint mt-0.5">
									{f.size_bytes ? (f.size_bytes / 1024 / 1024).toFixed(1) + ' MB' : '—'} · {fmtDate(f.created_at ?? '')}
								</p>
							</div>
							<button onclick={() => downloadFile(f.storage_path, f.name)} class="btn-icon shrink-0" title="Download">
								<IconDownloadSimpleRegular class="h-3.5 w-3.5" />
							</button>
						</div>
					{/each}
				</div>
			{/if}
			<form method="POST" action="?/upload_file" enctype="multipart/form-data"
				use:enhance={toastEnhance({ successMsg: 'File uploaded' })}
				class="{data.files.length > 0 ? 'pt-3 divide-top' : ''}">
				<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent">
					<IconPlusRegular class="h-3 w-3" /> Upload a file
					<input type="file" name="file" class="hidden" onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()} />
				</label>
			</form>
		</div>

		<!-- Comments -->
		{#if data.project}
			<div class="card">
				<CommentThread
					projectId={data.project.id}
					userId={data.user?.id}
					initial={data.comments}
				/>
				<form method="POST" action="?/comment"
					use:enhance={toastEnhance({ beforeUpdate: () => { comment = '' } })}
					class="flex gap-2">
					<input name="body" bind:value={comment} required placeholder="Write a message…" class="input" />
					<button type="submit" class="btn btn-primary shrink-0">Send</button>
				</form>
			</div>
		{/if}

	</div>
</div>
