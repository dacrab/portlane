<script lang="ts">
import { toast } from 'svelte-sonner'
import { formatDateLong, formatMoney } from '#lib/domain/format.js'
import {
	INVOICE_STATUS_LABEL,
	INVOICE_STATUS_TONE,
} from '#lib/domain/status.js'
import Badge from '#lib/ui/Badge.svelte'
import Button from '#lib/ui/Button.svelte'
import { page } from '$app/state'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()

const invoice = $derived(data.invoice)
const amount = $derived(formatMoney(invoice.amountCents, invoice.currency))
const issued = $derived(formatDateLong(invoice.createdAt))
</script>

<svelte:head>
	<title>Invoice · {invoice.projectName}</title>
	<style>
		@media print {
			.no-print {
				display: none !important;
			}
			body {
				background: white !important;
			}
		}
	</style>
</svelte:head>

<div class="space-y-6">
	<div class="no-print flex items-center justify-between gap-4">
		<a href="/dashboard/invoices" class="text-xs text-muted transition-colors hover:text-ink">
			← Invoices
		</a>
		<div class="flex gap-2">
			<Button
				variant="ghost"
				size="sm"
				onclick={() =>
					navigator.clipboard.writeText(page.url.href).then(() => toast.success('Link copied'))}
			>
				Copy link
			</Button>
			<Button size="sm" onclick={() => window.print()}>Print / Save PDF</Button>
		</div>
	</div>

	<article class="mx-auto max-w-2xl border border-line bg-surface p-8 sm:p-10">
		<header class="flex items-start justify-between gap-6 border-b border-line pb-8">
			<div>
				<p class="display text-[28px] leading-none">Invoice</p>
				<p class="mt-2 font-mono text-[11px] text-muted">
					{invoice.id.slice(0, 8).toUpperCase()}
				</p>
			</div>
			<div class="text-right">
				<Badge tone={INVOICE_STATUS_TONE[invoice.status]}>
					{INVOICE_STATUS_LABEL[invoice.status]}
				</Badge>
				<p class="mt-3 text-[11px] text-muted">Issued {issued}</p>
				{#if invoice.dueDate}
					<p class="text-[11px] text-muted">Due {formatDateLong(invoice.dueDate)}</p>
				{/if}
			</div>
		</header>

		<div class="grid grid-cols-2 gap-8 border-b border-line py-8">
			<div>
				<p class="text-[11px] text-muted">From</p>
				<p class="mt-1 text-[13px] font-medium text-ink">{invoice.freelancerName}</p>
			</div>
			<div>
				<p class="text-[11px] text-muted">To</p>
				<p class="mt-1 text-[13px] font-medium text-ink">{invoice.clientName}</p>
			</div>
		</div>

		<div class="py-8">
			<div class="flex items-start justify-between gap-6 border-b border-line pb-4 text-[11px] font-medium text-muted">
				<span>Description</span>
				<span>Amount</span>
			</div>
			<div class="flex items-start justify-between gap-6 pt-4">
				<div>
					<p class="text-[13px] font-medium text-ink">{invoice.projectName}</p>
					{#if invoice.projectDescription}
						<p class="mt-1 max-w-sm text-[11px] leading-relaxed text-muted">
							{invoice.projectDescription}
						</p>
					{/if}
				</div>
				<p class="tabular text-[13px] font-medium text-ink">{amount}</p>
			</div>
		</div>

		<div class="flex justify-end border-t border-line pt-4">
			<div class="w-48">
				<div class="flex items-baseline justify-between">
					<span class="text-[13px] font-medium text-ink">Total</span>
					<span class="display tabular text-[22px]">{amount}</span>
				</div>
			</div>
		</div>

		<p class="mt-10 text-center text-[11px] text-muted">Thank you for your business.</p>
	</article>
</div>
