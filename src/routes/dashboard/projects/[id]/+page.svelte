<script lang="ts">
	import { enhance } from '$app/forms';
	import IconCheckCircleRegular from 'phosphor-icons-svelte/IconCheckCircleRegular.svelte';
	import IconCheckCircleBold from 'phosphor-icons-svelte/IconCheckCircleBold.svelte';
	import IconCircleRegular from 'phosphor-icons-svelte/IconCircleRegular.svelte';
	import IconChatTextRegular from 'phosphor-icons-svelte/IconChatTextRegular.svelte';
	import IconArrowLeftRegular from 'phosphor-icons-svelte/IconArrowLeftRegular.svelte';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';
	import IconUserPlusRegular from 'phosphor-icons-svelte/IconUserPlusRegular.svelte';
	import IconTrashRegular from 'phosphor-icons-svelte/IconTrashRegular.svelte';
	import IconDownloadSimpleRegular from 'phosphor-icons-svelte/IconDownloadSimpleRegular.svelte';
	import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte';
	import IconLinkRegular from 'phosphor-icons-svelte/IconLinkRegular.svelte';
	import IconNoteRegular from 'phosphor-icons-svelte/IconNoteRegular.svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import AppSelect from '$lib/components/AppSelect.svelte';

	let { data }: { data: PageData } = $props();
	let comment = $state('');
	let newMilestone = $state('');
	let inviteEmail = $state('');
	let timeMinutes = $state('');
	let timeDesc = $state('');
	let noteBody = $state('');
	let projectStatus = $state('');
	$effect(() => { noteBody = data.note; projectStatus = data.project.status; });

	const statusBadge: Record<string, string> = {
		in_progress: 'badge badge-accent', review: 'badge badge-yellow',
		planning: 'badge badge-neutral',   completed: 'badge badge-green',
	};

	const totalMilestones = $derived(data.milestones.length);
	const doneMilestones = $derived(data.milestones.filter((m: any) => m.completed).length);
	const progress = $derived(totalMilestones ? Math.round((doneMilestones / totalMilestones) * 100) : 0);
	const totalMinutes = $derived((data.timeEntries as any[]).reduce((s: number, e: any) => s + e.minutes, 0));
	const totalHours = $derived((totalMinutes / 60).toFixed(1));

	const portalUrl = $derived(typeof window !== 'undefined'
		? `${window.location.origin}/portal?project=${data.project.id}`
		: `/portal?project=${data.project.id}`);

	function copyPortalLink() {
		navigator.clipboard.writeText(portalUrl);
		toast.success('Portal link copied!');
	}

	async function download(path: string, name: string) {
		const res = await fetch(`/api/file-url?path=${encodeURIComponent(path)}`);
		const { url } = await res.json();
		const a = document.createElement('a');
		a.href = url; a.download = name; a.click();
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-start gap-3">
		<a href="/dashboard/projects" class="btn-icon mt-1 shrink-0"><IconArrowLeftRegular class="h-4 w-4" /></a>
		<div class="flex-1 min-w-0">
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="page-title">{data.project.name}</h1>
				<form id="status-form" method="POST" action="?/update_status" use:enhance>
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
						onchange={(v) => { projectStatus = v; setTimeout(() => (document.getElementById('status-form') as HTMLFormElement)?.requestSubmit(), 0); }}
					/>
				</form>
			</div>
			{#if data.project.description}
				<p class="mt-1 text-sm" style="color:var(--color-text-muted)">{data.project.description}</p>
			{/if}
			<div class="mt-2 flex flex-wrap items-center gap-4 text-xs" style="color:var(--color-text-faint)">
				{#if data.project.due_date}
					<span>Due {new Date(data.project.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
				{/if}
				{#if totalMilestones > 0}
					<span>{doneMilestones}/{totalMilestones} milestones · {progress}%</span>
				{/if}
				<span>{totalHours}h logged</span>
			</div>
		</div>
		<div class="flex items-center gap-2 shrink-0">
			<button onclick={copyPortalLink} class="btn btn-ghost px-3 py-1.5 text-xs">
				<IconLinkRegular class="h-3.5 w-3.5" /> Copy portal link
			</button>
			<form method="POST" action="?/delete_project" use:enhance
				onsubmit={(e) => { if (!confirm('Delete this project? This cannot be undone.')) e.preventDefault(); }}>
				<button type="submit" class="btn-icon" title="Delete project">
					<span style="color:var(--color-zinc-400)"><IconTrashRegular class="h-4 w-4" /></span>
				</button>
			</form>
		</div>
	</div>

	<!-- Progress bar -->
	{#if totalMilestones > 0}
		<div>
			<div class="mb-1.5 flex items-center justify-between text-xs" style="color:var(--color-text-faint)">
				<span>Overall progress</span><span>{progress}%</span>
			</div>
			<div class="h-2 rounded-full overflow-hidden" style="background:var(--color-border)">
				<div class="h-full rounded-full transition-all" style="width:{progress}%;background:var(--color-accent-600)"></div>
			</div>
		</div>
	{/if}

	<!-- Main grid -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Left: milestones + time tracking -->
		<div class="lg:col-span-2 space-y-6">

			<!-- Milestones -->
			<div class="card">
				<div class="mb-4 flex items-center justify-between">
					<p class="card-label mb-0">Milestones</p>
					{#if totalMilestones > 0}
						<span class="text-xs" style="color:var(--color-text-faint)">{doneMilestones}/{totalMilestones} done</span>
					{/if}
				</div>
				{#if data.milestones.length > 0}
					<div class="mb-4 space-y-1">
						{#each data.milestones as m}
							<form method="POST" action="?/toggle_milestone" use:enhance
								class="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--color-bg)]">
								<input type="hidden" name="id" value={m.id} />
								<input type="hidden" name="completed" value={m.completed} />
								<button type="submit" class="shrink-0">
									{#if m.completed}
										<span style="color:var(--color-accent-600)"><IconCheckCircleBold class="h-4 w-4" /></span>
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
					use:enhance={() => async ({ update }) => { newMilestone = ''; await update(); }}
					class="flex gap-2 pt-3" style="border-top:1px solid var(--color-border-subtle)">
					<input name="name" bind:value={newMilestone} required placeholder="Add a milestone…" class="input" />
					<button type="submit" class="btn btn-primary px-3 shrink-0"><IconPlusRegular class="h-3.5 w-3.5" /></button>
				</form>
			</div>

			<!-- Time tracking -->
			<div class="card">
				<div class="mb-4 flex items-center justify-between">
					<p class="card-label mb-0">Time tracking</p>
					<span class="text-sm font-semibold" style="color:var(--color-text-heading)">{totalHours}h total</span>
				</div>
				{#if (data.timeEntries as any[]).length > 0}
					<div class="mb-4 overflow-hidden rounded-lg" style="border:1px solid var(--color-border-subtle)">
						{#each data.timeEntries as e, i}
							<div class="flex items-center gap-3 px-4 py-3" style="{i > 0 ? 'border-top:1px solid var(--color-border-subtle)' : ''}">
								<span style="color:var(--color-text-faint)"><IconClockRegular class="h-3.5 w-3.5 shrink-0" /></span>
								<span class="flex-1 text-sm" style="color:var(--color-text)">{e.description ?? 'No description'}</span>
								<span class="text-xs font-medium tabular-nums" style="color:var(--color-text-faint)">{(e.minutes / 60).toFixed(1)}h</span>
								<span class="text-xs" style="color:var(--color-text-faint)">{new Date(e.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
							</div>
						{/each}
					</div>
				{/if}
				<form method="POST" action="?/log_time"
					use:enhance={() => async ({ update }) => { timeMinutes = ''; timeDesc = ''; await update(); }}
					class="flex gap-2 pt-3" style="border-top:1px solid var(--color-border-subtle)">
					<input name="description" bind:value={timeDesc} placeholder="What did you work on?" class="input flex-1" />
					<input name="minutes" bind:value={timeMinutes} type="number" min="1" required placeholder="mins" class="input w-20 shrink-0" />
					<button type="submit" class="btn btn-primary px-3 shrink-0"><IconPlusRegular class="h-3.5 w-3.5" /></button>
				</form>
			</div>

			<!-- Comments -->
			<div class="card">
				<p class="card-label flex items-center gap-2 mb-4">
					<span style="color:var(--color-text-faint)"><IconChatTextRegular class="h-4 w-4" /></span> Comments
					{#if data.comments.length > 0}
						<span class="ml-auto text-xs font-normal" style="color:var(--color-text-faint)">{data.comments.length}</span>
					{/if}
				</p>
				{#if data.comments.length > 0}
					<div class="mb-4 space-y-3">
						{#each data.comments as c}
							<div class="flex items-start gap-3">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
									style="background:var(--color-accent-100);color:var(--color-accent-600)">
									{((c.profiles as any)?.full_name ?? '?')[0].toUpperCase()}
								</div>
								<div class="flex-1 rounded-lg px-4 py-3" style="background:var(--color-bg)">
									<p class="mb-1 text-xs font-semibold" style="color:var(--color-text-faint)">{(c.profiles as any)?.full_name ?? 'Unknown'}</p>
									<p class="text-sm" style="color:var(--color-text)">{c.body}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
				<form method="POST" action="?/comment"
					use:enhance={() => async ({ update }) => { comment = ''; await update(); }}
					class="flex gap-3 pt-3" style="border-top:1px solid var(--color-border-subtle)">
					<input name="body" bind:value={comment} required placeholder="Add a comment…" class="input" />
					<button type="submit" class="btn btn-primary px-5 shrink-0">Send</button>
				</form>
			</div>
		</div>

		<!-- Right column -->
		<div class="space-y-6">
			<!-- Clients -->
			<div class="card">
				<p class="card-label mb-4">Clients</p>
				{#if (data.clients as any[]).length > 0}
					<div class="mb-4 space-y-2">
						{#each data.clients as c}
							<div class="flex items-center gap-2.5 rounded-lg px-3 py-2" style="background:var(--color-bg)">
								<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
									style="background:var(--color-accent-100);color:var(--color-accent-600)">
									{((c as any).full_name ?? '?')[0].toUpperCase()}
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium truncate" style="color:var(--color-text)">{(c as any).full_name ?? '—'}</p>
								</div>
								<form method="POST" action="?/remove_client" use:enhance
									onsubmit={(e) => { if (!confirm('Remove this client from the project?')) e.preventDefault(); }}>
									<input type="hidden" name="client_id" value={(c as any).id} />
									<button type="submit" class="btn-icon shrink-0" title="Remove client">
										<span style="color:var(--color-zinc-400)"><IconTrashRegular class="h-3.5 w-3.5" /></span>
									</button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="mb-4 text-sm" style="color:var(--color-text-faint)">No clients yet.</p>
				{/if}
				<form method="POST" action="?/invite_client"
					use:enhance={() => async ({ update }) => { inviteEmail = ''; await update(); }}
					class="flex gap-2 pt-3" style="border-top:1px solid var(--color-border-subtle)">
					<input name="email" type="email" bind:value={inviteEmail} required placeholder="client@email.com" class="input min-w-0" />
					<button type="submit" class="btn btn-primary px-3 shrink-0"><IconUserPlusRegular class="h-3.5 w-3.5" /></button>
				</form>
			</div>

			<!-- Files -->
			<div class="card">
				<p class="card-label mb-4">Files</p>
				{#if data.files.length > 0}
					<div class="mb-4 space-y-2">
						{#each data.files as f}
							<div class="flex items-center gap-3 rounded-lg px-3 py-2.5" style="background:var(--color-bg);border:1px solid var(--color-border-subtle)">
								<div class="flex-1 min-w-0">
									<p class="truncate text-sm font-medium" style="color:var(--color-text)">{f.name}</p>
									<p class="mt-0.5 text-xs" style="color:var(--color-text-faint)">
										{f.size_bytes ? (f.size_bytes / 1024 / 1024).toFixed(1) + ' MB' : '—'} ·
										{new Date(f.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
									</p>
								</div>
								<button onclick={() => download(f.storage_path, f.name)} class="btn-icon shrink-0">
									<IconDownloadSimpleRegular class="h-3.5 w-3.5" />
								</button>
								<form method="POST" action="?/delete_file" use:enhance
									onsubmit={(e) => { if (!confirm('Delete this file?')) e.preventDefault(); }}>
									<input type="hidden" name="id" value={f.id} />
									<button type="submit" class="btn-icon shrink-0" title="Delete file">
										<span style="color:var(--color-zinc-400)"><IconTrashRegular class="h-3.5 w-3.5" /></span>
									</button>
								</form>
							</div>
						{/each}
					</div>
				{:else}
					<p class="mb-4 text-sm" style="color:var(--color-text-faint)">No files yet.</p>
				{/if}
				<form method="POST" action="?/upload_file" enctype="multipart/form-data" use:enhance
					class="pt-3" style="border-top:1px solid var(--color-border-subtle)">
					<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium" style="color:var(--color-accent-600)">
						<IconPlusRegular class="h-3 w-3" /> Upload file
						<input type="file" name="file" class="hidden" onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()} />
					</label>
				</form>
			</div>

			<!-- Internal notes -->
			<div class="card">
				<p class="card-label flex items-center gap-2 mb-4">
					<span style="color:var(--color-text-faint)"><IconNoteRegular class="h-3.5 w-3.5" /></span> Internal notes
				</p>
				<form method="POST" action="?/save_note" use:enhance>
					<textarea name="body" bind:value={noteBody} rows="5" placeholder="Private notes — not visible to clients…"
						class="input mb-3 resize-none w-full"></textarea>
					<button type="submit" class="btn btn-ghost text-xs px-3 py-1.5">Save note</button>
				</form>
			</div>
		</div>
	</div>
</div>
