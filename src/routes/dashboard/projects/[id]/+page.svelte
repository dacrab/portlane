<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import IconCheckCircleBold from 'phosphor-icons-svelte/IconCheckCircleBold.svelte';
	import IconCircleRegular from 'phosphor-icons-svelte/IconCircleRegular.svelte';
	import IconChatTextRegular from 'phosphor-icons-svelte/IconChatTextRegular.svelte';
	import IconArrowLeftRegular from 'phosphor-icons-svelte/IconArrowLeftRegular.svelte';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';
	import IconUserPlusRegular from 'phosphor-icons-svelte/IconUserPlusRegular.svelte';
	import IconDownloadSimpleRegular from 'phosphor-icons-svelte/IconDownloadSimpleRegular.svelte';
	import IconTrashRegular from 'phosphor-icons-svelte/IconTrashRegular.svelte';
	import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte';
	import IconLinkRegular from 'phosphor-icons-svelte/IconLinkRegular.svelte';
	import IconNoteRegular from 'phosphor-icons-svelte/IconNoteRegular.svelte';
	import IconExportRegular from 'phosphor-icons-svelte/IconExportRegular.svelte';
	import type { PageData } from './$types';
	import AppSelect from '$lib/components/AppSelect.svelte';
	import { fmtDate, fmtDateLong, downloadFile, confirmDelete } from '$lib/fmt';
	import Avatar from '$lib/components/Avatar.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import ActionDeleteButton from '$lib/components/ActionDeleteButton.svelte';

	let { data }: { data: PageData } = $props();
	let comment = $state('');
	let newMilestone = $state('');
	let inviteEmail = $state('');
	let inviting = $state(false);
	let timeMinutes = $state('');
	let timeDesc = $state('');
	let noteBody = $state(untrack(() => data.note));
	let projectStatus = $state(untrack(() => data.project.status));

	const totalMilestones = $derived(data.milestones.length);
	const doneMilestones = $derived(data.milestones.filter((m) => m.completed).length);
	const progress = $derived(totalMilestones ? Math.round((doneMilestones / totalMilestones) * 100) : 0);
	const totalMinutes = $derived(data.timeEntries.reduce((s, e) => s + e.minutes, 0));
	const totalHours = $derived((totalMinutes / 60).toFixed(1));

	function copyPortalLink() {
		navigator.clipboard.writeText(`${window.location.origin}/portal?project=${data.project.id}`);
		toast.success('Portal link copied to clipboard');
	}

	function exportTimeCSV() {
		const rows = [
			['Date', 'Description', 'Minutes', 'Hours'],
			...data.timeEntries.map((e) => [
				e.logged_at,
				e.description ?? '',
				e.minutes,
				(e.minutes / 60).toFixed(2),
			]),
			['', 'Total', totalMinutes, (totalMinutes / 60).toFixed(2)],
		];
		const csv = rows.map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = `${data.project.name}-time-entries.csv`;
		a.click();
		URL.revokeObjectURL(a.href);
		toast.success('Time entries exported');
	}


</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-start gap-3">
		<a href="/dashboard/projects" class="btn-icon mt-1 shrink-0"><IconArrowLeftRegular class="h-4 w-4" /></a>
		<div class="flex-1 min-w-0">
			<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">Project</p>
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="page-title">{data.project.name}</h1>
				<form id="status-form" method="POST" action="?/update_status"
					use:enhance={() => async ({ result, update }) => {
						await update();
						if (result.type !== 'error') toast.success('Status updated');
					}}>
					<input type="hidden" name="status" value={projectStatus} />
					<AppSelect
						bind:value={projectStatus}
						items={[
							{ value: 'planning', label: 'Planning' },
							{ value: 'in_progress', label: 'In Progress' },
							{ value: 'review', label: 'Review' },
							{ value: 'completed', label: 'Completed' },
							{ value: 'archived', label: 'Archived' },
						]}
						onchange={(v) => { projectStatus = v; (document.getElementById('status-form') as HTMLFormElement)?.requestSubmit(); }}
					/>
				</form>
			</div>
			{#if data.project.description}
				<p class="mt-1 text-sm text-muted">{data.project.description}</p>
			{/if}
			<div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-faint">
				{#if data.project.due_date}
					<span>Due {fmtDateLong(data.project.due_date)}</span>
				{/if}
				{#if totalMilestones > 0}
					<span>{doneMilestones}/{totalMilestones} milestones · {progress}%</span>
				{/if}
				<span>{totalHours}h logged</span>
			</div>
		</div>
		<div class="flex items-center gap-2 shrink-0">
			<button onclick={copyPortalLink} class="btn btn-ghost px-3 py-1.5 text-xs">
				<IconLinkRegular class="h-3.5 w-3.5" /><span class="hidden sm:inline">Copy portal link</span>
			</button>
			<form id="delete-project-form" method="POST" action="?/delete_project"
				use:enhance={() => async ({ update }) => { await update(); }}>
				<button type="button" class="btn-icon" title="Delete project"
					onclick={(e) => confirmDelete('This will permanently delete the project and all its data.', (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement)}>
					<span class="text-faint"><IconTrashRegular class="h-4 w-4" /></span>
				</button>
			</form>
		</div>
	</div>

	<!-- Progress bar -->
	{#if totalMilestones > 0}
		<ProgressBar current={doneMilestones} total={totalMilestones} label="Overall progress" />
	{/if}

	<!-- Main grid -->
	<div class="grid gap-5 lg:grid-cols-[1fr_22rem]">
		<!-- Left: milestones + time tracking + comments -->
		<div class="space-y-5">

			<!-- Milestones -->
			<div class="card">
				<SectionHeader title="Milestones" count={totalMilestones > 0 ? `${doneMilestones}/${totalMilestones} done` : undefined} />
				{#if data.milestones.length === 0}
					<p class="mb-4 text-sm text-faint">No milestones yet. Add one to track project progress.</p>
				{:else}
					<div class="mb-4 space-y-1">
						{#each data.milestones as m}
							<form method="POST" action="?/toggle_milestone"
								use:enhance={() => async ({ update }) => { await update(); }}
								class="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover-bg">
								<input type="hidden" name="id" value={m.id} />
								<input type="hidden" name="completed" value={m.completed} />
								<button type="submit" class="shrink-0">
									{#if m.completed}
										<span class="text-accent"><IconCheckCircleBold class="h-4 w-4" /></span>
									{:else}
										<span style="color:var(--color-zinc-300)"><IconCircleRegular class="h-4 w-4" /></span>
									{/if}
								</button>
								<span class="flex-1 text-sm" style="{m.completed ? 'color:var(--color-text-faint);text-decoration:line-through' : 'color:var(--color-text)'}">{m.name}</span>
							</form>
						{/each}
					</div>
				{/if}
				<form method="POST" action="?/add_milestone"
					use:enhance={() => async ({ update }) => {
						newMilestone = '';
						await update();
						toast.success('Milestone added');
					}}
					class="flex gap-2 pt-3 divide-top">
					<input name="name" bind:value={newMilestone} required placeholder="Add a milestone…" class="input" />
					<button type="submit" class="btn btn-primary px-3 shrink-0"><IconPlusRegular class="h-3.5 w-3.5" /></button>
				</form>
			</div>

			<!-- Time tracking -->
			<div class="card">
				<div class="mb-4 flex items-center justify-between">
					<p class="card-label mb-0">Time tracking</p>
					<div class="flex items-center gap-2">
						<span class="text-sm font-semibold text-heading">{totalHours}h total</span>
						{#if data.timeEntries.length > 0}
							<button onclick={exportTimeCSV} class="btn btn-ghost text-xs px-2 py-1 gap-1" title="Export CSV">
								<IconExportRegular class="h-3.5 w-3.5" /> CSV
							</button>
						{/if}
					</div>
				</div>
				{#if data.timeEntries.length === 0}
					<p class="mb-4 text-sm text-faint">No time logged yet. Track your hours below.</p>
				{:else}
					<div class="mb-4 overflow-hidden rounded-lg" style="border:1px solid var(--color-border-subtle)">
						{#each data.timeEntries as e, i}
							<div class="flex items-center gap-3 px-4 py-3" style="{i > 0 ? 'border-top:1px solid var(--color-border-subtle)' : ''}">
								<span class="text-faint"><IconClockRegular class="h-3.5 w-3.5 shrink-0" /></span>
								<span class="flex-1 text-sm text-body">{e.description ?? 'No description'}</span>
								<span class="text-xs font-medium tabular-nums text-faint">{(e.minutes / 60).toFixed(1)}h</span>
								<span class="text-xs text-faint">{fmtDate(e.logged_at)}</span>
							</div>
						{/each}
					</div>
				{/if}
				<form method="POST" action="?/log_time"
					use:enhance={() => async ({ update }) => {
						timeMinutes = ''; timeDesc = '';
						await update();
						toast.success('Time logged');
					}}
					class="flex gap-2 pt-3 divide-top">
					<input name="description" bind:value={timeDesc} placeholder="What did you work on?" class="input flex-1" />
					<input name="minutes" bind:value={timeMinutes} type="number" min="1" required placeholder="mins" class="input w-20 shrink-0" />
					<button type="submit" class="btn btn-primary px-3 shrink-0"><IconPlusRegular class="h-3.5 w-3.5" /></button>
				</form>
			</div>

			<!-- Comments -->
			<div class="card">
				<SectionHeader title="Comments" icon={IconChatTextRegular} count={data.comments.length || undefined} />
				{#if data.comments.length === 0}
					<p class="mb-4 text-sm text-faint">No comments yet.</p>
				{:else}
					<div class="mb-4 space-y-3 max-h-80 overflow-y-auto">
						{#each data.comments as c}
							<div class="flex items-start gap-3">
								<Avatar name={c.profiles?.full_name ?? "?"} size={7} />
								<div class="rounded-lg px-3 py-2.5 max-w-[85%]" style="background:var(--color-bg)">
									<p class="mb-0.5 text-xs font-semibold text-faint">{c.profiles?.full_name ?? 'Unknown'}</p>
									<p class="text-sm text-body">{c.body}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
				<form method="POST" action="?/comment"
					use:enhance={() => async ({ update }) => { comment = ''; await update(); toast.success('Comment posted'); }}
					class="flex gap-2 pt-3 divide-top">
					<input name="body" bind:value={comment} required placeholder="Add a comment…" class="input" />
					<button type="submit" class="btn btn-primary px-5 shrink-0">Send</button>
				</form>
			</div>
		</div>

		<!-- Right column -->
		<div class="space-y-5">
			<!-- Clients -->
			<div class="card">
				<SectionHeader title="Clients" />
				{#if data.clients.length === 0}
					<p class="mb-4 text-sm text-faint">No clients yet. Invite one below.</p>
				{:else}
					<div class="mb-4 space-y-2">
						{#each data.clients as c}
							<div class="flex items-center gap-2.5 rounded-lg px-3 py-2" style="background:var(--color-bg)">
								<Avatar name={c.full_name ?? "?"} size={7} />
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium truncate text-body">{c.full_name ?? '—'}</p>
								</div>
								<ActionDeleteButton action="?/remove_client" name="client_id" id={c.id} message="Remove this client from the project?" ondelete={() => toast.success('Client removed')} />
							</div>
						{/each}
					</div>
				{/if}
				<form method="POST" action="?/invite_client"
					use:enhance={() => {
						inviting = true;
						return async ({ result, update }) => {
							inviting = false;
							inviteEmail = '';
							await update();
							if (result.type === 'failure') {
								toast.error((result.data as { error?: string }).error ?? 'Invitation failed');
							} else {
								toast.success('Invitation sent', { description: 'The client will receive a magic link to access the portal.' });
							}
						};
					}}
					class="flex gap-2 pt-3 divide-top">
					<input name="email" type="email" bind:value={inviteEmail} required placeholder="client@email.com" class="input min-w-0" disabled={inviting} />
					<button type="submit" class="btn btn-primary px-3 shrink-0" disabled={inviting}>
						{#if inviting}
							<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
						{:else}
							<IconUserPlusRegular class="h-3.5 w-3.5" />
						{/if}
					</button>
				</form>
			</div>

			<!-- Files -->
			<div class="card">
				<SectionHeader title="Files" />
				{#if data.files.length === 0}
					<p class="mb-4 text-sm text-faint">No files uploaded yet.</p>
				{:else}
					<div class="mb-4 space-y-2">
						{#each data.files as f}
							<div class="flex items-center gap-3 rounded-lg px-3 py-2.5" style="background:var(--color-bg);border:1px solid var(--color-border-subtle)">
								<div class="flex-1 min-w-0">
									<p class="truncate text-sm font-medium text-body">{f.name}</p>
									<p class="mt-0.5 text-xs text-faint">
										{f.size_bytes ? (f.size_bytes / 1024 / 1024).toFixed(1) + ' MB' : '—'} ·
										{fmtDate(f.created_at ?? '')}
									</p>
								</div>
								<button onclick={() => downloadFile(f.storage_path, f.name)} class="btn-icon shrink-0" title="Download">
									<IconDownloadSimpleRegular class="h-3.5 w-3.5" />
								</button>
								<ActionDeleteButton action="?/delete_file" id={f.id} message={`Delete "${f.name}"?`} ondelete={() => toast.success('File deleted')} />
							</div>
						{/each}
					</div>
				{/if}
				<form method="POST" action="?/upload_file" enctype="multipart/form-data"
					use:enhance={() => async ({ update }) => { await update(); toast.success('File uploaded'); }}
					class="pt-3 divide-top">
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent">
						<IconPlusRegular class="h-3 w-3" /> Upload file
						<input type="file" name="file" class="hidden" onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()} />
					</label>
				</form>
			</div>

			<!-- Internal notes -->
			<div class="card">
				<SectionHeader title="Internal notes" icon={IconNoteRegular} />
				<form method="POST" action="?/save_note"
					use:enhance={() => async ({ update }) => { await update(); toast.success('Note saved'); }}>
					<textarea name="body" bind:value={noteBody} rows="5" placeholder="Private notes — not visible to clients…"
						class="input mb-3 resize-none w-full"></textarea>
					<button type="submit" class="btn btn-ghost text-xs px-3 py-1.5">Save note</button>
				</form>
			</div>
		</div>
	</div>
</div>
