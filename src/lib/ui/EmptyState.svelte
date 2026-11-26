<script lang="ts">
import type { Component, Snippet } from 'svelte'
import Button from './Button.svelte'

let {
	title,
	description,
	icon,
	action,
	children,
}: {
	title: string
	description: string
	icon?: Component<{ class?: string }>
	action?: { label: string; href?: string; onClick?: () => void }
	children?: Snippet
} = $props()
</script>

<div class="flex flex-col items-center justify-center px-6 py-16 text-center">
	{#if icon}
		{@const Icon = icon}
		<span class="mb-4 text-faint"><Icon class="h-7 w-7" /></span>
	{/if}
	<p class="text-sm font-medium text-ink">{title}</p>
	<p class="mt-1 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p>
	{#if action}
		<div class="mt-5">
			{#if action.href}
				<Button href={action.href} size="sm">{action.label}</Button>
			{:else}
				<Button onclick={action.onClick} size="sm">{action.label}</Button>
			{/if}
		</div>
	{/if}
	{@render children?.()}
</div>
