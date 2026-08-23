<script lang="ts">
let {
	name = '?',
	size = 7,
}: {
	name?: string
	size?: number
} = $props()

const initials = $derived(
	name
		.split(/[\s@]/)
		.filter(Boolean)
		.map((w) => w[0])
		.slice(0, 2)
		.join('')
		.toUpperCase() || '?',
)
const px = $derived(size * 4)
</script>

<div
	style="width:{px}px;height:{px}px;background:var(--color-accent-100);color:var(--color-accent-600);font-size:{Math.max(10, px * 0.35)}px"
	class="shrink-0 inline-flex items-center justify-center rounded-full font-semibold"
>{initials}</div>
