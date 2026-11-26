<script lang="ts">
let {
	value = $bindable(''),
	class: className = '',
	...rest
}: {
	value?: string
	class?: string
	[key: string]: unknown
} = $props()

const cls = $derived(
	`h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink placeholder:text-faint transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 ${className}`,
)
</script>

<input bind:value class={cls} {...rest} />
