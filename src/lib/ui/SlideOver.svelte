<script lang="ts">
import IconXRegular from 'phosphor-icons-svelte/IconXRegular.svelte'
import type { Snippet } from 'svelte'
import IconButton from './IconButton.svelte'

let {
	open = $bindable(),
	title,
	description,
	children,
}: {
	open: boolean
	title: string
	description?: string
	children: Snippet
} = $props()

function closeOnBackdrop(event: MouseEvent) {
	if (event.target === event.currentTarget) open = false
}
</script>

{#if open}
	<div
		role="presentation"
		class="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
		onclick={closeOnBackdrop}
	></div>

	<div class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-[var(--shadow-float)]">
		<header class="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
			<div>
				<h2 class="display text-xl leading-tight">{title}</h2>
				{#if description}
					<p class="mt-1 text-xs text-muted">{description}</p>
				{/if}
			</div>
			<IconButton label="Close" onclick={() => (open = false)}>
				<IconXRegular class="h-4 w-4" />
			</IconButton>
		</header>
		{@render children()}
	</div>
{/if}
