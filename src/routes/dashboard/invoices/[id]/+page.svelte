<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const inv = $derived(data.invoice as any);
	const project = $derived(inv.projects);
	const freelancerName = $derived(inv.freelancer?.full_name ?? '—');
	const clientName = $derived(inv.client?.full_name ?? '—');

	const statusColor: Record<string, string> = {
		draft: '#6b7280', sent: '#1d4ed8', paid: '#15803d', overdue: '#b91c1c',
	};

	const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
</script>

<svelte:head>
	<title>Invoice · {project?.name ?? ''}</title>
	<style>
		@media print {
			.no-print { display: none !important; }
			body { background: white !important; }
		}
	</style>
</svelte:head>

<!-- Toolbar (hidden on print) -->
<div class="no-print mb-6 flex items-center gap-3">
	<a href="/dashboard/invoices" class="text-sm text-faint">← Invoices</a>
	<div class="ml-auto flex gap-2">
		<button onclick={() => navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))}
			class="btn btn-ghost text-xs">Copy link</button>
		<button onclick={() => window.print()} class="btn btn-primary text-xs">Print / Save PDF</button>
	</div>
</div>

<!-- Invoice document -->
<div class="mx-auto max-w-2xl rounded-xl p-10" style="background:var(--color-bg-elevated);border:1px solid var(--color-border)">
	<!-- Header -->
	<div class="mb-10 flex items-start justify-between gap-6">
		<div>
			<div class="flex items-center gap-2 mb-4">
				<img src="/favicon.svg" alt="Portlane" class="h-6 w-6" />
				<span class="text-sm font-semibold text-heading">Portlane</span>
			</div>
			<p class="text-3xl font-bold tracking-tight text-heading">Invoice</p>
			<p class="mt-1 text-xs font-mono text-faint">{inv.id.slice(0, 8).toUpperCase()}</p>
		</div>
		<div class="text-right">
			<span class="inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize"
				style="background:{statusColor[inv.status]}18;color:{statusColor[inv.status]}">
				{inv.status}
			</span>
			<p class="mt-3 text-xs text-faint">Issued {today}</p>
			{#if inv.due_date}
				<p class="text-xs text-faint">
					Due {new Date(inv.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
				</p>
			{/if}
		</div>
	</div>

	<!-- From / To -->
	<div class="mb-10 grid grid-cols-2 gap-8">
		<div>
			<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-faint">From</p>
			<p class="text-sm font-semibold text-heading">{freelancerName}</p>
		</div>
		<div>
			<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-faint">To</p>
			<p class="text-sm font-semibold text-heading">{clientName}</p>
		</div>
	</div>

	<!-- Line item -->
	<div class="mb-10 overflow-hidden rounded-lg" style="border:1px solid var(--color-border)">
		<div class="grid px-5 py-3 text-xs font-semibold uppercase tracking-widest"
			style="grid-template-columns:1fr auto;color:var(--color-text-faint);border-bottom:1px solid var(--color-border)">
			<span>Description</span><span>Amount</span>
		</div>
		<div class="grid px-5 py-4" style="grid-template-columns:1fr auto">
			<div>
				<p class="text-sm font-medium text-heading">{project?.name ?? 'Project'}</p>
				{#if project?.description}
					<p class="mt-0.5 text-xs text-faint">{project.description}</p>
				{/if}
			</div>
			<p class="text-sm font-semibold text-heading">
				{inv.currency.toUpperCase()} {(inv.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
			</p>
		</div>
	</div>

	<!-- Total -->
	<div class="flex justify-end">
		<div class="w-48">
			<div class="flex justify-between py-2 text-sm" style="border-top:2px solid var(--color-border)">
				<span class="font-semibold text-heading">Total</span>
				<span class="font-bold text-base text-heading">
					{inv.currency.toUpperCase()} {(inv.amount_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
				</span>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<p class="mt-10 text-center text-xs text-faint">
		Thank you for your business.
	</p>
</div>
