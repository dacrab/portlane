<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconXRegular from 'phosphor-icons-svelte/IconXRegular.svelte';

	let { open = $bindable(), title, description, children }: {
		open: boolean;
		title: string;
		description?: string;
		children: Snippet;
	} = $props();

	function closeOnBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) open = false;
	}
</script>

{#if open}
	<div role="presentation" class="fixed inset-0 z-40"
		style="background:rgba(0,0,0,0.4);backdrop-filter:blur(2px)"
		onclick={closeOnBackdrop}></div>

	<div class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col shadow-2xl"
		style="background:var(--color-bg-elevated);border-left:1px solid var(--color-border)">
		<div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid var(--color-border)">
			<div>
				<h2 class="text-base font-semibold text-heading">{title}</h2>
				{#if description}
					<p class="mt-0.5 text-xs text-faint">{description}</p>
				{/if}
			</div>
			<button onclick={() => open = false} class="btn-icon"><IconXRegular class="h-4 w-4" /></button>
		</div>
		{@render children()}
	</div>
{/if}
