<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<div>
		<h1 class="page-title">Clients</h1>
		<p class="mt-1 text-sm" style="color:var(--color-text-muted)">{data.clients.length} total</p>
	</div>

	<div class="overflow-hidden rounded-xl" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
		{#if data.clients.length === 0}
			<div class="px-6 py-16 text-center text-sm" style="color:var(--color-text-faint)">
				No clients yet. Invite one from a project page.
			</div>
		{:else}
			{#each data.clients as c}
				<div class="row-link" style="border-bottom:1px solid var(--color-border-subtle)">
					<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
						style="background:var(--color-accent-100);color:var(--color-accent-600)">
						{(c.full_name ?? '?')[0].toUpperCase()}
					</div>
					<div class="flex-1 min-w-0">
						<p class="text-sm font-medium" style="color:var(--color-text)">{c.full_name ?? 'Unknown'}</p>
						<p class="mt-0.5 truncate text-xs" style="color:var(--color-text-faint)">{c.projects.join(', ')}</p>
					</div>
					<span class="badge badge-neutral">{c.projects.length} project{c.projects.length !== 1 ? 's' : ''}</span>
				</div>
			{/each}
		{/if}
	</div>
</div>
