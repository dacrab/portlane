<script lang="ts">
	let { current, total, label = 'Progress' }: {
		current: number;
		total: number;
		label?: string;
	} = $props();

	let pct = $derived(total > 0 ? Math.round((current / total) * 100) : 0);
</script>

<div>
	<div class="mb-1.5 flex items-center justify-between text-xs text-faint">
		<span>{label}</span><span>{current}/{total} · {pct}%</span>
	</div>
	<div class="h-1.5 rounded-full overflow-hidden" style="background:var(--color-border)">
		<div class="h-full rounded-full transition-all" style="width:{pct}%;background:var(--color-accent-600)"></div>
	</div>
</div>
