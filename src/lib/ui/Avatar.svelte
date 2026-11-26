<script lang="ts">
let {
	name = '?',
	size = 8,
}: {
	name?: string
	size?: number
} = $props()

const initials = $derived(
	name
		.split(/[\s@]+/)
		.filter(Boolean)
		.map((word) => word[0])
		.slice(0, 2)
		.join('')
		.toUpperCase() || '?',
)

const px = $derived(size * 4)
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-md bg-accent/10 font-medium text-accent"
	style="width:{px}px;height:{px}px;font-size:{Math.max(10, px * 0.32)}px"
>
	{initials}
</span>
