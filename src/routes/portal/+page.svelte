<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { onMount, untrack } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { fmtDate, fmtMoney, today, statusBadge, downloadFile } from '$lib/fmt';
	import Avatar from '$lib/components/Avatar.svelte';
	import IconCheckCircleBold from 'phosphor-icons-svelte/IconCheckCircleBold.svelte';
	import IconCircleRegular from 'phosphor-icons-svelte/IconCircleRegular.svelte';
	import IconDownloadSimpleRegular from 'phosphor-icons-svelte/IconDownloadSimpleRegular.svelte';
	import IconClockRegular from 'phosphor-icons-svelte/IconClockRegular.svelte';
	import IconChatTextRegular from 'phosphor-icons-svelte/IconChatTextRegular.svelte';
	import IconThumbsUpRegular from 'phosphor-icons-svelte/IconThumbsUpRegular.svelte';
	import IconArrowCounterClockwiseRegular from 'phosphor-icons-svelte/IconArrowCounterClockwiseRegular.svelte';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';
	import IconFileRegular from 'phosphor-icons-svelte/IconFileRegular.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import type { PageData } from './$types';

	type WithProfile = { profiles: { full_name: string | null } | null };

	let { data }: { data: PageData } = $props();
	let comment = $state('');
	let note = $state('');
	let submittingApproval = $state(false);
	let comments = $state(untrack(() => [...data.comments]));

	onMount(() => {
		if (!data.project) return;
		const channel = supabase
			.channel(`comments:${data.project.id}`)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `project_id=eq.${data.project.id}` },
				async (payload) => {
					const { data: row } = await supabase.from('comments').select('*, profiles(full_name)').eq('id', payload.new.id).single();
					if (row) {
						comments = [...comments, row];
						if (row.author_id !== data.user?.id)
							toast.info(`New message from ${(row as WithProfile).profiles?.full_name ?? 'someone'}`);
					}
				}
			).subscribe();
		return () => { supabase.removeChannel(channel); };
	});


	const freelancerName = $derived((data.project as WithProfile | null)?.profiles?.full_name ?? 'Your freelancer');
	const total = $derived(data.milestones.length);
	const done = $derived(data.milestones.filter((m: { completed: boolean }) => m.completed).length);
	const isClient = $derived(data.invoices.length > 0 && data.invoices[0]?.client_id === data.user?.id);

</script>

<div class="min-h-screen" style="background:var(--color-bg);font-family:var(--font-sans)">
	<!-- Nav -->
	<header class="sticky top-0 z-40"
		style="background:color-mix(in srgb, var(--color-bg-elevated) 90%, transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--color-border)">
		<div class="mx-auto flex h-13 max-w-[72rem] items-center justify-between px-6">
			<div class="flex items-center gap-2">
				<img src="/favicon.svg" alt="Portlane" class="h-5 w-5" />
				<span class="text-sm font-semibold tracking-tight text-heading">Portlane</span>
				{#if data.project}
					<span class="text-faint">/</span>
					<span class="text-sm text-muted truncate max-w-48">{data.project.name}</span>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				{#if data.project}
					<a href="/portal" class="text-xs text-faint hover:text-heading transition-colors">← All projects</a>
				{/if}
				<div class="flex items-center gap-2 pl-3" style="border-left:1px solid var(--color-border)">
					<Avatar name={data.user?.email ?? '?'} size={7} />
					<form method="POST" action="/logout">
						<button type="submit" class="text-xs text-faint hover:text-heading transition-colors">Log out</button>
					</form>
				</div>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-[72rem] px-6 py-8">

		{#if !data.project}
			<!-- Project list -->
			<div class="max-w-[40rem]">
				<div class="mb-6">
					<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">Client Portal</p>
					<h1 class="page-title">Your projects</h1>
				</div>
				{#if data.projects.length === 0}
					<div class="card"><EmptyState title="No projects yet" description="Your freelancer hasn't added you to any projects yet." compact /></div>
				{:else}
					<div class="space-y-3">
						{#each data.projects as p}
							<a href="/portal?project={p.id}" class="card flex items-center gap-4 no-underline hover-bg transition-colors">
								<Avatar name={p.name} size={10} />
								<div class="flex-1 min-w-0">
									<p class="text-sm font-semibold text-heading">{p.name}</p>
									<p class="text-xs text-faint">
										{(p as WithProfile).profiles?.full_name ?? 'Freelancer'}
										{#if p.due_date} · Due {fmtDate(p.due_date)}{/if}
									</p>
								</div>
								<span class="badge badge-neutral shrink-0">{p.status.replace('_', ' ')}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>

		{:else}
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
												{inv.due_date ? `Due ${fmtDate(inv.due_date)}` : fmtDate(inv.created_at!)}
											</p>
										</div>
										<span class="{statusBadge[inv.status] ?? 'badge badge-neutral'}">{inv.status}</span>
										{#if inv.status === 'paid'}
											<span class="text-xs font-medium text-green-600 ml-2">Paid</span>
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
												{f.size_bytes ? (f.size_bytes / 1024 / 1024).toFixed(1) + ' MB' : '—'} · {fmtDate(f.created_at!)}
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
							use:enhance={() => async ({ update }) => { await update(); toast.success('File uploaded'); }}
							class="{data.files.length > 0 ? 'pt-3 divide-top' : ''}">
							<label class="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-accent">
								<IconPlusRegular class="h-3 w-3" /> Upload a file
								<input type="file" name="file" class="hidden" onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()} />
							</label>
						</form>
					</div>

					<!-- Comments -->
					<div class="card">
						<SectionHeader title="Messages" icon={IconChatTextRegular} count={comments.length || undefined} />
						{#if comments.length > 0}
							<div class="space-y-3 mb-4 max-h-80 overflow-y-auto">
								{#each comments as c (c.id)}
									{@const isMe = c.author_id === data.user?.id}
									<div class="flex items-start gap-2.5" class:flex-row-reverse={isMe}>
										<Avatar name={(c as WithProfile).profiles?.full_name ?? '?'} size={7} />
										<div class="rounded-lg px-3 py-2.5 max-w-[85%]"
											style="background:{isMe ? 'var(--color-accent-50)' : 'var(--color-bg)'}">
											<p class="text-sm" style="color:{isMe ? 'var(--color-accent-700)' : 'var(--color-text)'}">{c.body}</p>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="mb-4 text-sm text-faint">No messages yet.</p>
						{/if}
						<form method="POST" action="?/comment"
							use:enhance={() => async ({ update }) => { comment = ''; await update(); }}
							class="flex gap-2">
							<input name="body" bind:value={comment} required placeholder="Write a message…" class="input" />
							<button type="submit" class="btn btn-primary shrink-0">Send</button>
						</form>
					</div>

				</div>
			</div>
		{/if}

	</div>
</div>
