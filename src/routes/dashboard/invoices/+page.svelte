<script lang="ts">
import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte'
import IconFileTextRegular from 'phosphor-icons-svelte/IconFileTextRegular.svelte'
import { toast } from 'svelte-sonner'
import { submitForm, toastEnhance } from '#lib/client/enhance.js'
import ActionDeleteButton from '#lib/components/ActionDeleteButton.svelte'
import { formatDate, formatMoney } from '#lib/domain/format.js'
import {
	INVOICE_STATUS_ITEMS,
	INVOICE_STATUS_LABEL,
	INVOICE_STATUS_TONE,
} from '#lib/domain/status.js'
import Badge from '#lib/ui/Badge.svelte'
import Button from '#lib/ui/Button.svelte'
import DatePicker from '#lib/ui/DatePicker.svelte'
import EmptyState from '#lib/ui/EmptyState.svelte'
import Field from '#lib/ui/Field.svelte'
import Input from '#lib/ui/Input.svelte'
import PageHeader from '#lib/ui/PageHeader.svelte'
import Section from '#lib/ui/Section.svelte'
import Select from '#lib/ui/Select.svelte'
import Stat from '#lib/ui/Stat.svelte'
import { enhance } from '$app/forms'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()

let showForm = $state(false)
let selectedProject = $state('')
let selectedClient = $state('')

const clients = $derived(
	data.projects.find((project) => project.id === selectedProject)?.clients ??
		[],
)
const clientItems = $derived(
	clients.map((client) => ({ value: client.id, label: client.name })),
)

const stats = $derived({
	total: data.invoices.length,
	outstanding: data.invoices
		.filter(
			(invoice) => invoice.status === 'sent' || invoice.status === 'overdue',
		)
		.reduce((sum, invoice) => sum + invoice.amountCents, 0),
	paid: data.invoices
		.filter((invoice) => invoice.status === 'paid')
		.reduce((sum, invoice) => sum + invoice.amountCents, 0),
	overdue: data.invoices.filter((invoice) => invoice.status === 'overdue')
		.length,
})
</script>

<div class="space-y-8">
	<PageHeader title="Invoices" description="{stats.total} total">
		{#snippet actions()}
			<Button size="sm" onclick={() => (showForm = !showForm)}>
				{showForm ? 'Close' : 'New invoice'}
			</Button>
		{/snippet}
	</PageHeader>

	{#if data.invoices.length > 0}
		<div class="grid grid-cols-3 gap-3">
			<Stat label="Outstanding" value={formatMoney(stats.outstanding)} tone="warning" />
			<Stat label="Paid" value={formatMoney(stats.paid)} tone="success" />
			<Stat label="Overdue" value={stats.overdue} tone={stats.overdue > 0 ? 'danger' : 'default'} />
		</div>
	{/if}

	{#if showForm}
		<Section title="Create invoice">
			<form
				method="POST"
				action="?/create"
				use:enhance={toastEnhance({
					successMsg: 'Invoice created',
					errorMsg: 'Failed to create invoice',
					beforeUpdate: () => {
						showForm = false
						selectedProject = ''
						selectedClient = ''
					},
				})}
				class="grid gap-4 sm:grid-cols-2"
			>
				<Field label="Project">
					<Select
						name="project_id"
						bind:value={selectedProject}
						items={data.projects.map((project) => ({
							value: project.id,
							label: project.name,
						}))}
						placeholder="Select project"
						required
						onchange={() => {
							selectedClient = ''
						}}
					/>
				</Field>
				<Field label="Client">
					<Select
						name="client_id"
						bind:value={selectedClient}
						items={clientItems}
						placeholder="Select client"
						required
					/>
				</Field>
				<Field label="Amount (USD)" for="invoice-amount">
					<Input
						id="invoice-amount"
						name="amount"
						type="number"
						min="0.01"
						step="0.01"
						required
						placeholder="500.00"
					/>
				</Field>
				<Field label="Due date" optional>
					<DatePicker name="due_date" placeholder="Pick a due date" />
				</Field>
				<div class="flex gap-2 pt-2 sm:col-span-2">
					<Button type="submit" size="sm">Create</Button>
					<Button type="button" variant="ghost" size="sm" onclick={() => (showForm = false)}>
						Cancel
					</Button>
				</div>
			</form>
		</Section>
	{/if}

	<div class="overflow-hidden rounded-lg border border-line bg-surface">
		{#if data.invoices.length === 0}
			<EmptyState
				icon={IconFileTextRegular}
				title="No invoices yet"
				description="Create your first invoice to start tracking payments."
				action={{ label: 'Create invoice', onClick: () => (showForm = true) }}
			/>
		{:else}
			<ul class="divide-y divide-line">
				{#each data.invoices as invoice (invoice.id)}
					<li class="flex items-center gap-4 px-6 py-4">
						<div class="min-w-0 flex-1">
							<p class="truncate text-[13px] font-medium text-ink">{invoice.projectName}</p>
							<p class="mt-0.5 text-[11px] text-muted">{invoice.clientName}</p>
						</div>

						<p class="hidden w-24 shrink-0 text-xs text-muted sm:block">
							{invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
						</p>

						<p class="w-24 shrink-0 text-right tabular text-[13px] font-medium text-ink sm:text-left">
							{formatMoney(invoice.amountCents, invoice.currency)}
						</p>

						<div class="w-32 shrink-0">
							<form
								id="invoice-status-{invoice.id}"
								method="POST"
								action="?/update_status"
								use:enhance={toastEnhance({ successMsg: 'Status updated' })}
							>
								<input type="hidden" name="id" value={invoice.id} />
								<input type="hidden" name="status" value={invoice.status} />
								<Select
									value={invoice.status}
									items={INVOICE_STATUS_ITEMS}
									onchange={(value: string) => {
										if (value !== invoice.status) submitForm(`invoice-status-${invoice.id}`)
									}}
								/>
							</form>
						</div>

						<Badge tone={INVOICE_STATUS_TONE[invoice.status]} class="hidden sm:inline-flex">
							{INVOICE_STATUS_LABEL[invoice.status]}
						</Badge>

						<a
							href="/dashboard/invoices/{invoice.id}"
							class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-raised hover:text-ink"
							aria-label="View invoice"
						>
							<IconArrowRightRegular class="h-4 w-4" />
						</a>

						<ActionDeleteButton
							action="?/delete"
							id={invoice.id}
							message="This permanently deletes the invoice."
							ondelete={() => toast.success('Invoice deleted')}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
