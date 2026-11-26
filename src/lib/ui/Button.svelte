<script lang="ts">
import type { Snippet } from 'svelte'

let {
	variant = 'primary',
	size = 'md',
	href,
	type = 'button',
	disabled = false,
	class: className = '',
	children,
	...rest
}: {
	variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
	size?: 'sm' | 'md'
	href?: string
	type?: 'button' | 'submit' | 'reset'
	disabled?: boolean
	class?: string
	children: Snippet
	[key: string]: unknown
} = $props()

const variants = {
	primary: 'bg-ink text-page hover:bg-ink-soft',
	secondary: 'border border-line bg-surface text-ink hover:bg-raised',
	ghost: 'text-body hover:bg-raised hover:text-ink',
	danger: 'border border-danger/25 bg-danger/10 text-danger hover:bg-danger/15',
}

const sizes = {
	sm: 'h-8 px-3 text-xs',
	md: 'h-9 px-4 text-[13px]',
}

const cls = $derived(
	`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`,
)
</script>

{#if href}
	<a {href} class={cls} {...rest}>{@render children()}</a>
{:else}
	<button {type} {disabled} class={cls} {...rest}>{@render children()}</button>
{/if}
