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
	`w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink placeholder:text-faint transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60 ${className}`,
)
</script>

<textarea bind:value class={cls} {...rest}></textarea>
