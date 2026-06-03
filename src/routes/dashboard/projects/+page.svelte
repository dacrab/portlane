<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { PageData, ActionData } from './$types';
	import AppSelect from '$lib/components/AppSelect.svelte';
	import AppDatePicker from '$lib/components/AppDatePicker.svelte';
	import IconPlusRegular from 'phosphor-icons-svelte/IconPlusRegular.svelte';
	import IconFolderOpenRegular from 'phosphor-icons-svelte/IconFolderOpenRegular.svelte';
	import IconXRegular from 'phosphor-icons-svelte/IconXRegular.svelte';
	import { fmtDate, today, statusBadge, statusLabel } from '$lib/fmt';

	import { page } from '$app/state';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let open = $state(page.url.searchParams.has('new'));
	let loading = $state(false);

	$effect(() => { if ((form as any)?.error) open = true; });

	let showArchived = $state(false);




	function progress(p: any) {
		const ms = p.milestones ?? [];
		if (!ms.length) return null;
		return Math.round((ms.filter((m: any) => m.completed).length / ms.length) * 100);
	}

	const visible = $derived(
		showArchived ? data.projects : data.projects.filter((p: any) => p.status !== 'archived')
	);
	const archivedCount = $derived(data.projects.filter((p: any) => p.status === 'archived').length);
	const activeCount = $derived(data.projects.filter((p: any) => !['completed', 'archived'].includes(p.status)).length);
	const reviewCount = $derived(data.projects.filter((p: any) => p.status === 'review').length);

	function focusOnMount(node: HTMLElement) { node.focus(); }
	function closeOnBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) open = false;
	}
</script>

<!-- Slide-over modal -->
{#if open}
	<!-- Backdrop -->
	<div
		role="presentation"
		class="fixed inset-0 z-40"
		style="background:rgba(0,0,0,0.4);backdrop-filter:blur(2px)"
		onclick={closeOnBackdrop}
	></div>

	<!-- Panel -->
	<div class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-2xl"
		style="background:var(--color-bg-elevated);border-left:1px solid var(--color-border)">

		<div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--color-border)">
			<div>
				<h2 class="text-base font-semibold text-heading">New project</h2>
				<p class="mt-0.5 text-xs text-faint">Fill in the details to get started.</p>
			</div>
			<button onclick={() => open = false} class="btn-icon"><IconXRegular class="h-4 w-4" /></button>
		</div>

		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'failure') {
						toast.error((result.data as any)?.error ?? 'Failed to create project');
					}
					await update();
				};
			}}
			class="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6"
		>
			{#if (form as any)?.error}
				<p class="form-error">{(form as any).error}</p>
			{/if}

			<div>
				<label for="proj-name" class="mb-1.5 block text-xs font-medium text-muted">Project name <span class="text-danger">*</span></label>
				<input id="proj-name" name="name" type="text" required use:focusOnMount class="input" placeholder="Brand Redesign" />
			</div>

			<div>
				<label for="proj-desc" class="mb-1.5 block text-xs font-medium text-muted">
					Description <span class="text-faint">(optional)</span>
				</label>
				<textarea id="proj-desc" name="description" rows="3" class="input resize-none"
					placeholder="Brief description of the project scope and goals…"></textarea>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="mb-1.5 text-xs font-medium text-muted">Due date <span class="text-faint">(optional)</span></p>
					<AppDatePicker name="due_date" placeholder="Pick a date" />
				</div>
				<div>
					<p class="mb-1.5 text-xs font-medium text-muted">Status</p>
					<AppSelect
						name="status"
						value="planning"
						items={[
							{ value: 'planning', label: 'Planning' },
							{ value: 'in_progress', label: 'In Progress' },
						]}
					/>
				</div>
			</div>

			<div>
				<label for="client_email" class="mb-1.5 block text-xs font-medium text-muted">
					Invite client <span class="text-faint">(optional)</span>
				</label>
				<input id="client_email" name="client_email" type="email" class="input" placeholder="client@company.com" />
				<p class="mt-1 text-xs text-faint">They'll receive a magic link to access the portal.</p>
			</div>

			<div class="mt-auto flex gap-3 pt-4 divide-top">
				<button type="submit" disabled={loading} class="btn btn-primary flex-1 justify-center">
					{loading ? 'Creating…' : 'Create project'}
				</button>
				<button type="button" onclick={() => open = false} class="btn btn-ghost">Cancel</button>
			</div>
		</form>
	</div>
{/if}

<!-- Page -->
<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">Workspace</p>
			<h1 class="page-title">Projects</h1>
			<p class="mt-0.5 text-sm text-muted">{visible.length} shown · {activeCount} active · {reviewCount} in review</p>
		</div>
		<div class="flex items-center gap-2">
			{#if archivedCount > 0}
				<button
					onclick={() => showArchived = !showArchived}
					class="btn btn-ghost text-xs px-3 gap-1.5"
					style={showArchived ? 'border-color:var(--color-accent-600);color:var(--color-accent-600)' : ''}
				>
					{showArchived ? 'Hide archived' : `Archived (${archivedCount})`}
				</button>
			{/if}
			<button onclick={() => open = true} class="btn btn-primary">
				<IconPlusRegular class="h-4 w-4" /><span class="hidden sm:inline"> New project</span>
			</button>
		</div>
	</div>

	<div class="overflow-hidden rounded-xl card p-0">
		{#if visible.length > 0}
			<div class="hidden sm:grid px-6 py-2.5 text-xs font-medium divide-bottom text-faint"
				style="grid-template-columns:1fr 120px 80px 100px">
				<span>Project</span>
				<span>Progress</span>
				<span class="text-center">Clients</span>
				<span class="text-right">Status</span>
			</div>
		{/if}

		{#if visible.length === 0}
			<div class="flex flex-col items-center justify-center px-6 py-20 text-center">
				<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-subtle">
					<span class="text-faint"><IconFolderOpenRegular class="h-6 w-6" /></span>
				</div>
				<p class="text-sm font-medium text-body">No projects yet</p>
				<p class="mt-1 text-xs text-faint">Create a project and invite your first client.</p>
				<button onclick={() => open = true} class="mt-4 btn btn-primary text-xs px-4">Create project</button>
			</div>
		{:else}
			{#each visible as p}
				{@const pct = progress(p)}
				{@const overdue = p.due_date && p.due_date < today() && p.status !== 'completed'}
				{@const clientCount = (p.project_clients as any)?.[0]?.count ?? 0}
				<a href="/dashboard/projects/{p.id}"
					class="flex items-center gap-4 px-6 py-4 transition-colors hover-bg divide-bottom no-underline"
					style="opacity:{p.status === 'archived' ? '0.6' : '1'}">
					<div class="flex flex-1 items-center gap-3 min-w-0">
						<div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold bg-accent-soft">
							{p.name.at(0)?.toUpperCase()}
						</div>
						<div class="min-w-0">
							<p class="text-sm font-medium truncate text-body">{p.name}</p>
							<p class="mt-0.5 text-xs" class:text-danger={overdue} class:text-faint={!overdue}>
								{overdue ? '⚠ Overdue · ' : (p.due_date ? 'Due ' : '')}
								{p.due_date ? fmtDate(p.due_date) : "No due date"}
							</p>
						</div>
					</div>
					<div class="hidden sm:flex w-[120px] items-center gap-2 shrink-0">
						{#if pct !== null}
							<div class="h-1.5 flex-1 rounded-full overflow-hidden bg-subtle">
								<div class="h-full rounded-full" style="width:{pct}%;background:var(--color-accent-600)"></div>
							</div>
							<span class="text-xs w-7 text-right tabular-nums text-faint">{pct}%</span>
						{:else}
							<span class="text-xs text-faint">—</span>
						{/if}
					</div>
					<div class="hidden sm:flex w-[80px] justify-center shrink-0">
						<span class="text-xs font-medium text-faint">{clientCount}</span>
					</div>
					<div class="w-[100px] flex justify-end shrink-0">
						<span class="{statusBadge[p.status] ?? 'badge badge-neutral'}">{statusLabel[p.status] ?? p.status}</span>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>
