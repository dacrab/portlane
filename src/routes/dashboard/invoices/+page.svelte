<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let showForm = $state(false);
	let selectedProject = $state('');

	const statusBadge: Record<string, string> = {
		draft: 'badge badge-neutral', sent: 'badge badge-blue',
		paid:  'badge badge-green',   overdue: 'badge badge-red',
	};
	const clients = $derived(
		(data.projects.find((p: any) => p.id === selectedProject)?.project_clients ?? [])
			.map((pc: any) => pc.profiles).filter(Boolean)
	);
</script>

<div class="space-y-8">
	<div class="flex items-end justify-between">
		<div>
			<h1 class="page-title">Invoices</h1>
			<p class="mt-1 text-sm" style="color:var(--color-text-muted)">{data.invoices.length} total</p>
		</div>
		<button onclick={() => showForm = !showForm} class="btn btn-primary">New invoice</button>
	</div>

	{#if showForm}
		<div class="card">
			<p class="card-label">Create invoice</p>
			<form method="POST" action="?/create"
				use:enhance={() => async ({ update }) => { showForm = false; await update(); }}
				class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="inv_project" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Project</label>
					<select id="inv_project" name="project_id" required bind:value={selectedProject} class="input">
						<option value="">Select project…</option>
						{#each data.projects as p}<option value={p.id}>{p.name}</option>{/each}
					</select>
				</div>
				<div>
					<label for="inv_client" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Client</label>
					<select id="inv_client" name="client_id" required class="input">
						<option value="">Select client…</option>
						{#each clients as c}<option value={(c as any).id}>{(c as any).full_name ?? (c as any).id}</option>{/each}
					</select>
				</div>
				<div>
					<label for="inv_amount" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Amount (USD)</label>
					<input id="inv_amount" name="amount" type="number" min="0" step="0.01" required placeholder="500.00" class="input" />
				</div>
				<div>
					<label for="inv_due" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Due date <span style="color:var(--color-text-faint)">(optional)</span></label>
					<input id="inv_due" name="due_date" type="date" class="input" />
				</div>
				<div class="sm:col-span-2 flex gap-2 pt-2" style="border-top:1px solid var(--color-border-subtle)">
					<button type="submit" class="btn btn-primary">Create</button>
					<button type="button" onclick={() => showForm = false} class="btn btn-ghost">Cancel</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
		{#if data.invoices.length === 0}
			<div class="px-6 py-16 text-center text-sm" style="color:var(--color-text-faint)">No invoices yet.</div>
		{:else}
			{#each data.invoices as inv}
				<div class="row-link" style="border-bottom:1px solid var(--color-border-subtle)">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium" style="color:var(--color-text)">{(inv.projects as any)?.name ?? '—'}</p>
						<p class="mt-0.5 text-xs" style="color:var(--color-text-faint)">
							{(inv.profiles as any)?.full_name ?? '—'} ·
							{inv.due_date ? 'Due ' + new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
						</p>
					</div>
					<p class="text-sm font-semibold" style="color:var(--color-text-heading)">${(inv.amount_cents / 100).toFixed(2)}</p>
					<form method="POST" action="?/update_status" use:enhance>
						<input type="hidden" name="id" value={inv.id} />
						<select name="status" onchange={(e) => (e.currentTarget.form as HTMLFormElement).requestSubmit()} value={inv.status}
							class="{statusBadge[inv.status] ?? 'badge badge-neutral'} border-0 outline-none cursor-pointer">
							<option value="draft">Draft</option>
							<option value="sent">Sent</option>
							<option value="paid">Paid</option>
							<option value="overdue">Overdue</option>
						</select>
					</form>
				</div>
			{/each}
		{/if}
	</div>
</div>
