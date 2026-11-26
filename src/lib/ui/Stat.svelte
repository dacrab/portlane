<script lang="ts">
let {
	label,
	value,
	note,
	tone = 'default',
}: {
	label: string
	value: string | number
	note?: string
	tone?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
} = $props()

const tones = {
	default: 'text-ink',
	accent: 'text-accent',
	success: 'text-success',
	warning: 'text-warning',
	danger: 'text-danger',
}
</script>

<div class="rounded-lg border border-line bg-surface px-5 py-4">
	<p class="text-xs text-muted">{label}</p>
	<p class="display mt-2 text-[30px] leading-none tabular {tones[tone]}">{value}</p>
	{#if note}
		<p class="mt-2 text-xs text-faint">{note}</p>
	{/if}
</div>
