<script lang="ts">
	import { enhance } from '$app/forms';
	import IconCheckCircleRegular from 'phosphor-icons-svelte/IconCheckCircleRegular.svelte';
	import IconCheckCircleBold from 'phosphor-icons-svelte/IconCheckCircleBold.svelte';
	import IconCircleRegular from 'phosphor-icons-svelte/IconCircleRegular.svelte';
	import IconDownloadSimpleRegular from 'phosphor-icons-svelte/IconDownloadSimpleRegular.svelte';
	import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte';
	import IconChatTextRegular from 'phosphor-icons-svelte/IconChatTextRegular.svelte';
	import IconThumbsUpRegular from 'phosphor-icons-svelte/IconThumbsUpRegular.svelte';
	import IconArrowCounterClockwiseRegular from 'phosphor-icons-svelte/IconArrowCounterClockwiseRegular.svelte';
	import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let comment = $state('');
	let note = $state('');

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

<div class="min-h-screen" style="background:var(--color-bg)">
	<!-- Header -->
	<header style="border-bottom:1px solid var(--color-border);background:var(--color-bg-elevated)">
		<div class="mx-auto flex max-w-4xl items-center justify-between px-6 py-3.5">
			<div class="flex items-center gap-2.5">
				<img src="/favicon.svg" alt="Portlane" class="h-6 w-6" />
				<span class="text-[13px] font-semibold" style="color:var(--color-text-heading)">Portlane</span>
			</div>
			<div class="flex items-center gap-3">
				{#if data.project}
					<a href="/portal" class="text-xs" style="color:var(--color-text-faint)">← All projects</a>
				{/if}
				<span class="rounded-full px-2.5 py-0.5 text-xs font-medium" style="background:var(--color-bg-subtle);color:var(--color-text-faint)">Client Portal</span>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-4xl px-6 py-8 space-y-6">

	{#if !data.project}
		<!-- Project list -->
		<div>
			<h1 class="text-lg font-semibold mb-1" style="color:var(--color-text-heading)">Your projects</h1>
			<p class="text-sm" style="color:var(--color-text-faint)">Select a project to view its details.</p>
		</div>
		{#if data.projects.length === 0}
			<div class="card py-16 text-center text-sm" style="color:var(--color-text-faint)">No projects yet.</div>
		{:else}
			<div class="space-y-3">
				{#each data.projects as p}
					<a href="/portal?project={p.id}" class="card flex items-center gap-4 hover:border-[var(--color-accent-300)] transition-colors no-underline">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
							style="background:var(--color-accent-100);color:var(--color-accent-600)">
							{p.name[0].toUpperCase()}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-semibold" style="color:var(--color-text-heading)">{p.name}</p>
							<p class="text-xs" style="color:var(--color-text-faint)">
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
					<h1 class="text-lg font-semibold" style="color:var(--color-text-heading)">{data.project.name}</h1>
					<p class="mt-0.5 text-sm" style="color:var(--color-text-faint)">Managed by {freelancerName}</p>
				</div>
				<span class="badge badge-accent shrink-0">{data.project.status.replace('_', ' ')}</span>
			</div>
			{#if total > 0}
				<div class="mt-5">
					<div class="mb-1.5 flex items-center justify-between text-xs" style="color:var(--color-text-faint)">
						<span>Overall progress</span><span>{done}/{total} milestones · {progress}%</span>
					</div>
					<div class="h-2 rounded-full overflow-hidden" style="background:var(--color-bg-subtle)">
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
					<p class="text-sm" style="color:var(--color-text-faint)">No milestones yet.</p>
				{:else}
					<div class="space-y-3">
						{#each data.milestones as m, i}
							<div class="flex items-center gap-3">
								{#if m.completed}
									<span style="color:var(--color-accent-600)"><IconCheckCircleBold class="h-4 w-4 shrink-0" /></span>
								{:else}
									<span style="color:var(--color-zinc-300)"><IconCircleRegular class="h-4 w-4 shrink-0" /></span>
								{/if}
								<span class="flex-1 text-sm" style="{m.completed ? 'color:var(--color-text-faint);text-decoration:line-through' : 'color:var(--color-text)'}">{m.name}</span>
								{#if !m.completed && data.milestones[i - 1]?.completed}
									<span class="flex items-center gap-1 text-[11px] font-medium" style="color:var(--color-accent-600)">
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
					<p class="text-sm" style="color:var(--color-text-faint)">No files yet.</p>
				{:else}
					<div class="space-y-2">
						{#each data.files as f}
							<div class="flex items-center gap-3 rounded-lg px-3 py-2.5" style="border:1px solid var(--color-border-subtle)">
								<div class="flex-1 min-w-0">
									<p class="truncate text-sm font-medium" style="color:var(--color-text)">{f.name}</p>
									<p class="text-xs" style="color:var(--color-text-faint)">
										{f.size_bytes ? (f.size_bytes / 1024 / 1024).toFixed(1) + ' MB' : '—'} ·
										{new Date(f.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
									</p>
								</div>
								<button onclick={() => download(f.storage_path, f.name)} class="btn-icon shrink-0">
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
						<div class="flex items-center gap-4 rounded-lg px-3 py-3" style="border:1px solid var(--color-border-subtle)">
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium" style="color:var(--color-text)">
									${(inv.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
								</p>
								{#if inv.due_date}
									<p class="text-xs" style="color:{inv.due_date < today && inv.status !== 'paid' ? '#b91c1c' : 'var(--color-text-faint)'}">
										Due {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
									</p>
								{:else}
									<p class="text-xs" style="color:var(--color-text-faint)">
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
			<p class="mb-4 text-sm" style="color:var(--color-text-muted)">Leave an optional note, then approve the work or request changes.</p>
			<textarea bind:value={note} placeholder="Optional note for the freelancer…" rows="2" class="input mb-4 resize-none"></textarea>
			<div class="flex gap-3">
				<form method="POST" action="?/approve" use:enhance>
					<input type="hidden" name="note" value={note} />
					<button type="submit" class="btn btn-primary">
						<IconThumbsUpRegular class="h-3.5 w-3.5" /> Approve work
					</button>
				</form>
				<form method="POST" action="?/request_revision" use:enhance>
					<input type="hidden" name="note" value={note} />
					<button type="submit" class="btn btn-ghost">
						<IconArrowCounterClockwiseRegular class="h-3.5 w-3.5" /> Request revision
					</button>
				</form>
			</div>
		</div>

		<!-- Comments -->
		<div class="card">
			<p class="card-label flex items-center gap-2">
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
			<form method="POST" action="?/comment" use:enhance={() => async ({ update }) => { comment = ''; await update(); }} class="flex gap-2">
				<input name="body" bind:value={comment} required placeholder="Leave a message…" class="input" />
				<button type="submit" class="btn btn-primary px-5 shrink-0">Send</button>
			</form>
		</div>
	{/if}

	</div>
</div>
