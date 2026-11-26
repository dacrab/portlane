<script lang="ts">
let {
	size = 'md',
	href = '/',
	inverse = false,
}: {
	size?: 'sm' | 'md'
	href?: string
	inverse?: boolean
} = $props()

const text = $derived(size === 'sm' ? 'text-[15px]' : 'text-[17px]')
const mark = $derived(size === 'sm' ? 'h-6 w-6' : 'h-7 w-7')
</script>

<a {href} class="inline-flex items-center gap-2.5 no-underline" aria-label="Portlane">
	<img src="/favicon.svg" alt="" class={mark} />
	<span class="font-medium tracking-[-0.02em] {text} {inverse ? 'text-page' : 'text-ink'}">Portlane</span>
</a>
