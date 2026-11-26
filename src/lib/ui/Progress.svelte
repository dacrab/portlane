<script lang="ts">
let {
	current,
	total,
	label = 'Progress',
}: {
	current: number
	total: number
	label?: string
} = $props()

const pct = $derived(total > 0 ? Math.round((current / total) * 100) : 0)
</script>

<div>
	<div class="mb-2 flex items-baseline justify-between gap-4">
		<span class="text-xs text-muted">{label}</span>
		<span class="text-xs tabular text-faint">{current} of {total} · {pct}%</span>
	</div>
	<div class="h-1.5 overflow-hidden rounded-xs bg-raised">
		<div class="h-full rounded-xs bg-accent" style="width:{pct}%"></div>
	</div>
</div>
