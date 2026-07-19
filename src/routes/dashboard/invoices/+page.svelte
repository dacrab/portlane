<script lang="ts">
import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte'
import IconFileTextRegular from 'phosphor-icons-svelte/IconFileTextRegular.svelte'
import { toast } from 'svelte-sonner'
import { enhance } from '$app/forms'
import { toastEnhance } from '$lib/client/enhance'
import ActionDeleteButton from '$lib/components/ActionDeleteButton.svelte'
import AppDatePicker from '$lib/components/AppDatePicker.svelte'
import AppSelect from '$lib/components/AppSelect.svelte'
import EmptyState from '$lib/components/EmptyState.svelte'
import SectionHeader from '$lib/components/SectionHeader.svelte'
import { fmtDate, fmtMoney, INVOICE_STATUS_ITEMS } from '$lib/fmt'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()
let showForm = $state(false)
let selectedProject = $state('')
let selectedClient = $state('')

let invoiceStatusOverrides = $state<Record<string, string>>({})

type ProjectLight = {
	id: string
	name: string
	clients: { id: string; name: string | null }[] | null
}

function getStatus(inv: { id: string; status: string }) {
	return invoiceStatusOverrides[inv.id] ?? inv.status
}

const clients = $derived(
	data.projects.find((p: ProjectLight) => p.id === selectedProject)?.clients ??
		[],
)

const clientItems = $derived(
	clients.map((c) => ({ value: c.id, label: c.name ?? c.id })),
)

const stats = $derived({
	total: data.invoices.length,
	outstanding: data.invoices
		.filter((i) => i.status === 'sent')
		.reduce((s, i) => s + i.amount_cents, 0),
	paid: data.invoices
		.filter((i) => i.status === 'paid')
		.reduce((s, i) => s + i.amount_cents, 0),
	overdue: data.invoices.filter((i) => i.status === 'overdue').length,
})

const statusItems = INVOICE_STATUS_ITEMS
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
			<SectionHeader title="Create invoice" />
			<form method="POST" action="?/create"
				use:enhance={toastEnhance({
					successMsg: 'Invoice created',
					errorMsg: 'Failed to create invoice',
					beforeUpdate: () => {
						showForm = false
						selectedProject = ''
						selectedClient = ''
					},
				})}
				class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="mb-1.5 text-xs font-medium text-muted">Project</p>
					<AppSelect
						name="project_id"
						bind:value={selectedProject}
						items={data.projects.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
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
			<EmptyState icon={IconFileTextRegular} title="No invoices yet" description="Create your first invoice to start tracking payments." action={{ label: 'Create invoice', onClick: () => showForm = true }} />
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
						<p class="text-sm font-medium text-body">{inv.project_name ?? '—'}</p>
						<p class="mt-0.5 text-xs text-faint">{inv.client_name ?? '—'}</p>
					</div>
					<p class="hidden sm:block text-sm text-faint shrink-0">
						{inv.due_date ? fmtDate(inv.due_date) : '—'}
					</p>
					<p class="text-sm font-semibold text-heading shrink-0">{fmtMoney(inv.amount_cents)}</p>
					<div class="w-28 shrink-0">
						<form id="inv-status-{inv.id}" method="POST" action="?/update_status"
							use:enhance={toastEnhance({ successMsg: 'Status updated' })}>
							<input type="hidden" name="id" value={inv.id} />
							<input type="hidden" name="status" value={getStatus(inv)} />
							<AppSelect
								value={getStatus(inv)}
								items={statusItems}
								onchange={(v: string) => {
									invoiceStatusOverrides[inv.id] = v;
									const el = document.getElementById(`inv-status-${inv.id}`);
									if (el instanceof HTMLFormElement) el.requestSubmit();
								}}
							/>
						</form>
					</div>
					<a href="/dashboard/invoices/{inv.id}" class="btn-icon shrink-0" title="View invoice">
						<IconArrowRightRegular class="h-3.5 w-3.5" />
					</a>
				<ActionDeleteButton action="?/delete" id={inv.id} message="This will permanently delete the invoice." ondelete={() => toast.success('Invoice deleted')} />
				</div>
			{/each}
		{/if}
	</div>
</div>
