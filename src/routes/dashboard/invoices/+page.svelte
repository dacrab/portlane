<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import AppSelect from '$lib/components/AppSelect.svelte';
	import AppDatePicker from '$lib/components/AppDatePicker.svelte';
	import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte';
	import IconTrashRegular from 'phosphor-icons-svelte/IconTrashRegular.svelte';

	let { data }: { data: PageData } = $props();
	let showForm = $state(false);
	let selectedProject = $state('');
	let selectedClient = $state('');

	let invoiceStatuses = $state<Record<string, string>>(
		Object.fromEntries(data.invoices.map((inv: any) => [inv.id, inv.status]))
	);

	const statusBadge: Record<string, string> = {
		draft: 'badge badge-neutral', sent: 'badge badge-blue',
		paid:  'badge badge-green',   overdue: 'badge badge-red',
	};

	const clients = $derived(
		(data.projects.find((p: any) => p.id === selectedProject)?.project_clients ?? [])
			.map((pc: any) => pc.profiles).filter(Boolean)
	);

	const clientItems = $derived(clients.map((c: any) => ({ value: c.id, label: c.full_name ?? c.id })));

	const stats = $derived({
		total: data.invoices.length,
		outstanding: data.invoices.filter((i: any) => i.status === 'sent').reduce((s: number, i: any) => s + i.amount_cents, 0),
		paid: data.invoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + i.amount_cents, 0),
		overdue: data.invoices.filter((i: any) => i.status === 'overdue').length,
	});

	function fmt(cents: number) {
		return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 });
	}

	const statusItems = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'sent', label: 'Sent' },
		{ value: 'paid', label: 'Paid' },
		{ value: 'overdue', label: 'Overdue' },
	];
</script>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="page-title">Invoices</h1>
			<p class="mt-0.5 text-sm" style="color:var(--color-text-muted)">{stats.total} total</p>
		</div>
		<button onclick={() => showForm = !showForm} class="btn btn-primary">New invoice</button>
	</div>

	<!-- Summary stats -->
	{#if data.invoices.length > 0}
		<div class="grid grid-cols-3 gap-4">
			<div class="card py-4">
				<p class="text-xs font-medium" style="color:var(--color-text-faint)">Outstanding</p>
				<p class="mt-1 text-xl font-semibold tracking-tight" style="color:#b45309">{fmt(stats.outstanding)}</p>
			</div>
			<div class="card py-4">
				<p class="text-xs font-medium" style="color:var(--color-text-faint)">Paid</p>
				<p class="mt-1 text-xl font-semibold tracking-tight" style="color:#15803d">{fmt(stats.paid)}</p>
			</div>
			<div class="card py-4">
				<p class="text-xs font-medium" style="color:var(--color-text-faint)">Overdue</p>
				<p class="mt-1 text-xl font-semibold tracking-tight" style="color:{stats.overdue > 0 ? '#b91c1c' : 'var(--color-text-heading)'}">{stats.overdue}</p>
			</div>
		</div>
	{/if}

	<!-- Create form -->
	{#if showForm}
		<div class="card">
			<p class="card-label">Create invoice</p>
			<form method="POST" action="?/create"
				use:enhance={() => async ({ update }) => { showForm = false; selectedProject = ''; selectedClient = ''; await update(); }}
				class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="mb-1.5 text-xs font-medium" style="color:var(--color-zinc-700)">Project</p>
					<AppSelect
						name="project_id"
						bind:value={selectedProject}
						items={data.projects.map((p: any) => ({ value: p.id, label: p.name }))}
						placeholder="Select project…"
						required
						onchange={() => { selectedClient = ''; }}
					/>
				</div>
				<div>
					<p class="mb-1.5 text-xs font-medium" style="color:var(--color-zinc-700)">Client</p>
					<AppSelect
						name="client_id"
						bind:value={selectedClient}
						items={clientItems}
						placeholder="Select client…"
						required
					/>
				</div>
				<div>
					<label for="inv_amount" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Amount (USD)</label>
					<input id="inv_amount" name="amount" type="number" min="0" step="0.01" required placeholder="500.00" class="input" />
				</div>
				<div>
					<p class="mb-1.5 text-xs font-medium" style="color:var(--color-zinc-700)">
						Due date <span style="color:var(--color-text-faint)">(optional)</span>
					</p>
					<AppDatePicker name="due_date" placeholder="Pick a due date" />
				</div>
				<div class="sm:col-span-2 flex gap-2 pt-2" style="border-top:1px solid var(--color-border-subtle)">
					<button type="submit" class="btn btn-primary">Create</button>
					<button type="button" onclick={() => showForm = false} class="btn btn-ghost">Cancel</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Invoice table -->
	<div class="overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
		{#if data.invoices.length === 0}
			<div class="px-6 py-16 text-center text-sm" style="color:var(--color-text-faint)">No invoices yet.</div>
		{:else}
			<div class="hidden sm:grid px-6 py-2.5 text-xs font-medium" style="grid-template-columns:1fr 120px 120px 140px;color:var(--color-text-faint);border-bottom:1px solid var(--color-border-subtle)">
				<span>Project / Client</span>
				<span>Due date</span>
				<span class="text-right">Amount</span>
				<span class="text-right">Status</span>
			</div>
			{#each data.invoices as inv}
				<div class="flex items-center gap-4 px-6 py-4" style="border-bottom:1px solid var(--color-border-subtle)">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium" style="color:var(--color-text)">{(inv.projects as any)?.name ?? '—'}</p>
						<p class="mt-0.5 text-xs" style="color:var(--color-text-faint)">{(inv.profiles as any)?.full_name ?? '—'}</p>
					</div>
					<p class="hidden sm:block w-[120px] text-sm" style="color:var(--color-text-faint)">
						{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
					</p>
					<p class="w-[120px] text-right text-sm font-semibold" style="color:var(--color-text-heading)">${(inv.amount_cents / 100).toFixed(2)}</p>
					<div class="w-[140px] flex justify-end">
						<form id="inv-status-{inv.id}" method="POST" action="?/update_status" use:enhance>
							<input type="hidden" name="id" value={inv.id} />
							<input type="hidden" name="status" value={invoiceStatuses[inv.id] ?? inv.status} />
							<AppSelect
								bind:value={invoiceStatuses[inv.id]}
								items={statusItems}
								onchange={() => setTimeout(() => (document.getElementById(`inv-status-${inv.id}`) as HTMLFormElement)?.requestSubmit(), 0)}
							/>
						</form>
					</div>
					<a href="/dashboard/invoices/{inv.id}" class="btn-icon shrink-0" title="View invoice">
						<IconArrowRightRegular class="h-3.5 w-3.5" />
					</a>
					<form method="POST" action="?/delete" use:enhance
						onsubmit={(e) => { if (!confirm('Delete this invoice?')) e.preventDefault(); }}>
						<input type="hidden" name="id" value={inv.id} />
						<button type="submit" class="btn-icon shrink-0" title="Delete invoice">
							<span style="color:var(--color-zinc-400)"><IconTrashRegular class="h-3.5 w-3.5" /></span>
						</button>
					</form>
				</div>
			{/each}
		{/if}
	</div>
</div>
