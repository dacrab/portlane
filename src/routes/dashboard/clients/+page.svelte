<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();

	const colors = [
		'var(--color-accent-600)', '#b45309', '#15803d', '#1d4ed8', '#7c3aed', '#b91c1c',
	];
	function color(name: string) {
		let h = 0;
		for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
		return colors[h % colors.length];
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="page-title">Clients</h1>
		<p class="mt-0.5 text-sm" style="color:var(--color-text-muted)">{data.clients.length} total</p>
	</div>

	{#if data.clients.length === 0}
		<div class="rounded-xl px-6 py-20 text-center" style="border:1px solid var(--color-border);background:var(--color-bg-elevated)">
			<p class="text-sm" style="color:var(--color-text-faint)">No clients yet. Invite one from a project page.</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each data.clients as c}
				{@const name = c.full_name ?? 'Unknown'}
				{@const initials = name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
				{@const accent = color(name)}
				<div class="card flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
							style="background:{accent}18;color:{accent}">
							{initials}
						</div>
						<div class="min-w-0">
							<p class="text-sm font-semibold truncate" style="color:var(--color-text-heading)">{name}</p>
							<p class="text-xs" style="color:var(--color-text-faint)">{c.projects.length} project{c.projects.length !== 1 ? 's' : ''}</p>
						</div>
					</div>
					{#if c.projects.length > 0}
						<div class="space-y-1">
							{#each c.projects as proj}
								<p class="truncate rounded px-2 py-1 text-xs" style="background:var(--color-bg-subtle);color:var(--color-text-muted)">{proj}</p>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
