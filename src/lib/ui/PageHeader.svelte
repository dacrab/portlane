<script lang="ts">
import IconArrowLeftRegular from 'phosphor-icons-svelte/IconArrowLeftRegular.svelte'
import type { Snippet } from 'svelte'

let {
	title,
	description,
	back,
	actions,
}: {
	title: string
	description?: string
	back?: { href: string; label: string }
	actions?: Snippet
} = $props()
</script>

<header class="flex flex-wrap items-start justify-between gap-4">
	<div class="min-w-0">
		{#if back}
			<a href={back.href} class="mb-3 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink">
				<IconArrowLeftRegular class="h-3.5 w-3.5" />
				{back.label}
			</a>
		{/if}
		<h1 class="display text-[28px] leading-none">{title}</h1>
		{#if description}
			<p class="mt-2 max-w-2xl text-[13px] text-muted">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 flex-wrap items-center gap-2">{@render actions()}</div>
	{/if}
</header>
