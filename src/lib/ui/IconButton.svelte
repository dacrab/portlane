<script lang="ts">
import type { Snippet } from 'svelte'

let {
	label,
	href,
	type = 'button',
	disabled = false,
	class: className = '',
	children,
	...rest
}: {
	label: string
	href?: string
	type?: 'button' | 'submit' | 'reset'
	disabled?: boolean
	class?: string
	children: Snippet
	[key: string]: unknown
} = $props()

const cls = $derived(
	`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-50 ${className}`,
)
</script>

{#if href}
	<a {href} class={cls} aria-label={label} title={label} {...rest}>{@render children()}</a>
{:else}
	<button {type} {disabled} class={cls} aria-label={label} title={label} {...rest}>{@render children()}</button>
{/if}
