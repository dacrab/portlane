<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { onMount, untrack } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { Toaster } from 'svelte-sonner';
	import IconCheckCircleBold from 'phosphor-icons-svelte/IconCheckCircleBold.svelte';
	import IconCircleRegular from 'phosphor-icons-svelte/IconCircleRegular.svelte';
	import IconDownloadSimpleRegular from 'phosphor-icons-svelte/IconDownloadSimpleRegular.svelte';
	import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte';
	import IconChatTextRegular from 'phosphor-icons-svelte/IconChatTextRegular.svelte';
	import IconThumbsUpRegular from 'phosphor-icons-svelte/IconThumbsUpRegular.svelte';
	import IconArrowCounterClockwiseRegular from 'phosphor-icons-svelte/IconArrowCounterClockwiseRegular.svelte';
	import IconFileRegular from 'phosphor-icons-svelte/IconFileRegular.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let comment = $state('');
	let note = $state('');
	let submittingApproval = $state(false);

	// Real-time: keep comments in reactive state
	let comments = $state(untrack(() => [...data.comments]));

	onMount(() => {
		if (!data.project) return;

		const channel = supabase
			.channel(`comments:${data.project.id}`)
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'comments', filter: `project_id=eq.${data.project.id}` },
				async (payload) => {
					// Fetch the new comment with profile data
					const { data: row } = await supabase
						.from('comments')
						.select('*, profiles(full_name)')
						.eq('id', payload.new.id)
						.single();
					if (row) {
						comments = [...comments, row];
						// Only notify if this wasn't the current user's own comment
						if (row.author_id !== data.user?.id) {
							toast.info(`New comment from ${(row.profiles as any)?.full_name ?? 'someone'}`);
						}
					}
				}
			)
			.subscribe();

		return () => { supabase.removeChannel(channel); };
	});

	async function download(path: string, name: string) {
		const res = await fetch(`/api/file-url?path=${encodeURIComponent(path)}`);
		const { url } = await res.json();
		const a = document.createElement('a');
		a.href = url; a.download = name; a.click();
	}

	const freelancerName = $derived((data.project?.profiles as any)?.full_name ?? 'Your freelancer');
	const total = $derived(data.milestones.length);
	const done = $derived(data.milestones.filter((m: any) => m.completed).length);
	const progress = $derived(total ? Math.round((done / total) * 100) : 0);

	const statusBadge: Record<string, string> = {
		draft: 'badge badge-neutral', sent: 'badge badge-blue',
		paid: 'badge badge-green',    overdue: 'badge badge-red',
	};
	const today = new Date().toISOString().split('T').at(0) ?? '';
</script>

<Toaster richColors position="bottom-right" />

<div class="min-h-screen bg-base">
	<header style="border-bottom:1px solid var(--color-border);background:var(--color-bg-elevated)">
		<div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
			<div class="flex items-center gap-2.5">
				<img src="/favicon.svg" alt="Portlane" class="h-6 w-6" />
				<span class="text-[13px] font-semibold text-heading">Portlane</span>
			</div>
			<div class="flex items-center gap-3">
				{#if data.project}
					<a href="/portal" class="text-xs text-faint">← All projects</a>
				{/if}
				<span class="rounded-full px-2.5 py-0.5 text-xs font-medium" style="background:var(--color-bg-subtle);color:var(--color-text-faint)">Client Portal</span>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-4xl px-4 py-6 space-y-6 sm:px-6 sm:py-8" style="padding-bottom:max(1.5rem,env(safe-area-inset-bottom))">

	{#if !data.project}
		<div>
			<h1 class="text-lg font-semibold mb-1 text-heading">Your projects</h1>
			<p class="text-sm text-faint">Select a project to view its details.</p>
		</div>
		{#if data.projects.length === 0}
			<div class="card flex flex-col items-center py-16 text-center">
				<p class="text-sm font-medium text-body">No projects yet</p>
				<p class="mt-1 text-xs text-faint">Your freelancer hasn't added you to any projects yet.</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each data.projects as p}
					<a href="/portal?project={p.id}" class="card flex items-center gap-4 hover:border-[var(--color-accent-300)] transition-colors no-underline">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
							style="background:var(--color-accent-100);color:var(--color-accent-600)">
							{p.name[0].toUpperCase()}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold text-heading">{p.name}</p>
							<p class="text-xs text-faint">
								{(p.profiles as any)?.full_name ?? 'Freelancer'}
								{#if p.due_date} · Due {new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{/if}
							</p>
						</div>
						<span class="badge badge-neutral shrink-0">{p.status.replace('_', ' ')}</span>
					</a>
				{/each}
			</div>
		{/if}

	{:else}
		<!-- Project hero -->
		<div class="card">
			<div class="flex items-start justify-between gap-4">
				<div>
					<h1 class="text-lg font-semibold text-heading">{data.project.name}</h1>
					<p class="mt-0.5 text-sm text-faint">Managed by {freelancerName}</p>
				</div>
				<span class="badge badge-accent shrink-0">{data.project.status.replace('_', ' ')}</span>
			</div>
			{#if total > 0}
				<div class="mt-5">
					<div class="mb-1.5 flex items-center justify-between text-xs text-faint">
						<span>Overall progress</span><span>{done}/{total} milestones · {progress}%</span>
					</div>
					<div class="h-2 rounded-full overflow-hidden bg-subtle">
						<div class="h-full rounded-full transition-all" style="width:{progress}%;background:var(--color-accent-600)"></div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Timeline + Files -->
		<div class="grid gap-6 sm:grid-cols-2">
			<!-- Milestones -->
			<div class="card">
				<p class="card-label">Timeline</p>
				{#if data.milestones.length === 0}
					<p class="text-sm text-faint">No milestones added yet.</p>
				{:else}
					<div class="space-y-3">
						{#each data.milestones as m, i}
							<div class="flex items-center gap-3">
								{#if m.completed}
									<span class="text-accent"><IconCheckCircleBold class="h-4 w-4 shrink-0" /></span>
								{:else}
									<span style="color:var(--color-zinc-300)"><IconCircleRegular class="h-4 w-4 shrink-0" /></span>
								{/if}
								<span class="flex-1 text-sm" style="{m.completed ? 'color:var(--color-text-faint);text-decoration:line-through' : 'color:var(--color-text)'}">{m.name}</span>
								{#if !m.completed && data.milestones[i - 1]?.completed}
									<span class="flex items-center gap-1 text-[11px] font-medium text-accent">
										<IconClockRegular class="h-3 w-3" /> Active
									</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Files -->
			<div class="card">
				<p class="card-label">Deliverables</p>
				{#if data.files.length === 0}
					<div class="flex flex-col items-center py-6 text-center">
						<span class="text-faint"><IconFileRegular class="h-8 w-8 mb-2" /></span>
						<p class="text-sm text-faint">No files uploaded yet.</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each data.files as f}
							<div class="flex items-center gap-3 rounded-lg px-3 py-2.5 border-subtle">
								<div class="flex-1 min-w-0">
									<p class="truncate text-sm font-medium text-body">{f.name}</p>
									<p class="text-xs text-faint">
										{f.size_bytes ? (f.size_bytes / 1024 / 1024).toFixed(1) + ' MB' : '—'} ·
										{new Date(f.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
									</p>
								</div>
								<button onclick={() => download(f.storage_path, f.name)} class="btn-icon shrink-0" title="Download">
									<IconDownloadSimpleRegular class="h-3.5 w-3.5" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Invoices -->
		{#if data.invoices.length > 0}
			<div class="card">
				<p class="card-label">Invoices</p>
				<div class="space-y-2">
					{#each data.invoices as inv}
						<div class="flex items-center gap-4 rounded-lg px-3 py-3 border-subtle">
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-body">
									${(inv.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
								</p>
								{#if inv.due_date}
									<p class="text-xs" class:text-danger={inv.due_date < today && inv.status !== 'paid'} class:text-faint={!(inv.due_date < today && inv.status !== 'paid')}>
										Due {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
									</p>
								{:else}
									<p class="text-xs text-faint">
										{new Date(inv.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
									</p>
								{/if}
							</div>
							<span class="{statusBadge[inv.status] ?? 'badge badge-neutral'}">{inv.status}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Approval -->
		<div class="card">
			<p class="card-label">Review &amp; Approval</p>
			<p class="mb-4 text-sm text-muted">Leave an optional note, then approve the work or request changes.</p>
			<textarea bind:value={note} placeholder="Optional note for the freelancer…" rows="2" class="input mb-4 resize-none"></textarea>
			<div class="flex gap-3">
				<form method="POST" action="?/approve"
					use:enhance={() => {
						submittingApproval = true;
						return async ({ update }) => {
							submittingApproval = false;
							note = '';
							await update();
							toast.success('Work approved!', { description: 'The freelancer has been notified.' });
						};
					}}>
					<input type="hidden" name="note" value={note} />
					<button type="submit" class="btn btn-primary" disabled={submittingApproval}>
						<IconThumbsUpRegular class="h-3.5 w-3.5" /> Approve work
					</button>
				</form>
				<form method="POST" action="?/request_revision"
					use:enhance={() => {
						submittingApproval = true;
						return async ({ update }) => {
							submittingApproval = false;
							note = '';
							await update();
							toast.info('Revision requested', { description: 'The freelancer has been notified.' });
						};
					}}>
					<input type="hidden" name="note" value={note} />
					<button type="submit" class="btn btn-ghost" disabled={submittingApproval}>
						<IconArrowCounterClockwiseRegular class="h-3.5 w-3.5" /> Request revision
					</button>
				</form>
			</div>
		</div>

		<!-- Comments (real-time) -->
		<div class="card">
			<p class="card-label flex items-center gap-2">
				<span class="text-faint"><IconChatTextRegular class="h-4 w-4" /></span> Comments
				{#if comments.length > 0}
					<span class="ml-auto text-xs font-normal text-faint">{comments.length}</span>
				{/if}
			</p>
			{#if comments.length > 0}
				<div class="mb-4 space-y-3">
					{#each comments as c (c.id)}
						<div class="flex items-start gap-3">
							<div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
								style="background:var(--color-accent-100);color:var(--color-accent-600)">
								{((c.profiles as any)?.full_name ?? '?')[0].toUpperCase()}
							</div>
							<div class="flex-1 rounded-lg px-4 py-3 bg-base">
								<p class="mb-1 text-xs font-semibold text-faint">{(c.profiles as any)?.full_name ?? 'Unknown'}</p>
								<p class="text-sm text-body">{c.body}</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="mb-4 text-sm text-faint">No comments yet. Start the conversation.</p>
			{/if}
			<form method="POST" action="?/comment"
				use:enhance={() => async ({ update }) => {
					comment = '';
					await update();
				}}
				class="flex gap-2">
				<input name="body" bind:value={comment} required placeholder="Leave a message…" class="input" />
				<button type="submit" class="btn btn-primary px-5 shrink-0">Send</button>
			</form>
		</div>
	{/if}

	</div>
</div>
