<script lang="ts">
import type { Snippet } from 'svelte'

let {
	title,
	meta,
	actions,
	flush = false,
	class: className = '',
	children,
}: {
	title: string
	meta?: string
	actions?: Snippet
	flush?: boolean
	class?: string
	children: Snippet
} = $props()
</script>

<section class="overflow-hidden rounded-lg border border-line bg-surface {className}">
	<header class="flex min-h-12 items-center justify-between gap-4 border-b border-line px-6 py-3">
		<div class="flex min-w-0 items-center gap-3">
			<span class="lane-mark"></span>
			<h2 class="truncate text-[13px] font-medium text-ink">{title}</h2>
			{#if meta}
				<span class="shrink-0 text-xs tabular text-faint">{meta}</span>
			{/if}
		</div>
		{#if actions}
			<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
		{/if}
	</header>
	<div class={flush ? '' : 'px-6 py-5'}>
		{@render children()}
	</div>
</section>
