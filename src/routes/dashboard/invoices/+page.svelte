<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';
	import AppSelect from '$lib/components/AppSelect.svelte';
	import AppDatePicker from '$lib/components/AppDatePicker.svelte';
	import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte';
	import IconTrashRegular from 'phosphor-icons-svelte/IconTrashRegular.svelte';
	import IconFileTextRegular from 'phosphor-icons-svelte/IconFileTextRegular.svelte';
	import { fmtMoney, fmtDate, statusBadge, confirmDelete } from '$lib/fmt';

	let { data }: { data: PageData } = $props();
	let showForm = $state(false);
	let selectedProject = $state('');
	let selectedClient = $state('');

	let invoiceStatusOverrides = $state<Record<string, string>>({});

	function getStatus(inv: any) {
		return invoiceStatusOverrides[inv.id] ?? inv.status;
	}


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
			<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">Billing</p>
			<h1 class="page-title">Invoices</h1>
			<p class="mt-0.5 text-sm text-muted">{stats.total} total</p>
		</div>
		<button onclick={() => showForm = !showForm} class="btn btn-primary">New invoice</button>
	</div>

	<!-- Summary stats -->
	{#if data.invoices.length > 0}
		<div class="grid grid-cols-3 gap-4">
			<div class="card py-4">
				<p class="text-xs font-medium text-faint">Outstanding</p>
				<p class="mt-1 text-xl font-semibold tracking-tight text-warning">{fmtMoney(stats.outstanding)}</p>
			</div>
			<div class="card py-4">
				<p class="text-xs font-medium text-faint">Paid</p>
				<p class="mt-1 text-xl font-semibold tracking-tight text-success">{fmtMoney(stats.paid)}</p>
			</div>
			<div class="card py-4">
				<p class="text-xs font-medium text-faint">Overdue</p>
				<p class="mt-1 text-xl font-semibold tracking-tight" class:text-danger={stats.overdue > 0} class:text-heading={stats.overdue === 0}>{stats.overdue}</p>
			</div>
		</div>
	{/if}

	<!-- Create form -->
	{#if showForm}
		<div class="card">
			<p class="card-label">Create invoice</p>
			<form method="POST" action="?/create"
				use:enhance={() => async ({ result, update }) => {
					showForm = false; selectedProject = ''; selectedClient = '';
					await update();
					if (result.type !== 'failure') toast.success('Invoice created');
					else toast.error('Failed to create invoice');
				}}
				class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="mb-1.5 text-xs font-medium text-muted">Project</p>
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
					<p class="mb-1.5 text-xs font-medium text-muted">Client</p>
					<AppSelect
						name="client_id"
						bind:value={selectedClient}
						items={clientItems}
						placeholder="Select client…"
						required
					/>
				</div>
				<div>
					<label for="inv_amount" class="mb-1.5 block text-xs font-medium text-muted">Amount (USD)</label>
					<input id="inv_amount" name="amount" type="number" min="0" step="0.01" required placeholder="500.00" class="input" />
				</div>
				<div>
					<p class="mb-1.5 text-xs font-medium text-muted">
						Due date <span class="text-faint">(optional)</span>
					</p>
					<AppDatePicker name="due_date" placeholder="Pick a due date" />
				</div>
				<div class="sm:col-span-2 flex gap-2 pt-2 divide-top">
					<button type="submit" class="btn btn-primary">Create</button>
					<button type="button" onclick={() => showForm = false} class="btn btn-ghost">Cancel</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Invoice table -->
	<div class="overflow-hidden rounded-xl card p-0">
		{#if data.invoices.length === 0}
			<div class="flex flex-col items-center justify-center px-6 py-20 text-center">
				<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-subtle">
					<span class="text-faint"><IconFileTextRegular class="h-6 w-6" /></span>
				</div>
				<p class="text-sm font-medium text-body">No invoices yet</p>
				<p class="mt-1 text-xs text-faint">Create your first invoice to start tracking payments.</p>
				<button onclick={() => showForm = true} class="mt-4 btn btn-primary text-xs px-4">Create invoice</button>
			</div>
		{:else}
			<div class="hidden sm:grid px-4 py-2.5 text-xs font-medium divide-bottom text-faint"
				style="grid-template-columns:1fr auto auto auto auto auto">
				<span>Project / Client</span>
				<span class="pr-4">Due date</span>
				<span class="pr-4">Amount</span>
				<span class="pr-4">Status</span>
				<span></span><span></span>
			</div>
			{#each data.invoices as inv}
				<div class="flex items-center gap-4 px-6 py-4 divide-bottom">
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium text-body">{(inv.projects as any)?.name ?? '—'}</p>
						<p class="mt-0.5 text-xs text-faint">{(inv.profiles as any)?.full_name ?? '—'}</p>
					</div>
					<p class="hidden sm:block text-sm text-faint shrink-0">
						{inv.due_date ? fmtDate(inv.due_date) : '—'}
					</p>
					<p class="text-sm font-semibold text-heading shrink-0">{fmtMoney(inv.amount_cents)}</p>
					<div class="w-28 shrink-0">
						<form id="inv-status-{inv.id}" method="POST" action="?/update_status"
							use:enhance={() => async ({ update }) => { await update(); toast.success('Status updated'); }}>
							<input type="hidden" name="id" value={inv.id} />
							<input type="hidden" name="status" value={getStatus(inv)} />
							<AppSelect
								value={getStatus(inv)}
								items={statusItems}
								onchange={(v) => {
									invoiceStatusOverrides[inv.id] = v;
									(document.getElementById(`inv-status-${inv.id}`) as HTMLFormElement)?.requestSubmit();
								}}
							/>
						</form>
					</div>
					<a href="/dashboard/invoices/{inv.id}" class="btn-icon shrink-0" title="View invoice">
						<IconArrowRightRegular class="h-3.5 w-3.5" />
					</a>
					<form method="POST" action="?/delete"
						use:enhance={() => async ({ update }) => { await update(); toast.success('Invoice deleted'); }}>
						<input type="hidden" name="id" value={inv.id} />
						<button type="button" class="btn-icon shrink-0" title="Delete invoice"
								onclick={(e) => confirmDelete('This will permanently delete the invoice.', (e.currentTarget as HTMLElement).closest('form') as HTMLFormElement)}>
							<span class="text-faint"><IconTrashRegular class="h-3.5 w-3.5" /></span>
						</button>
					</form>
				</div>
			{/each}
		{/if}
	</div>
</div>
