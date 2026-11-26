<script lang="ts">
import type { Snippet } from 'svelte'
import type { Tone } from '#lib/domain/status.js'

let {
	tone = 'neutral',
	class: className = '',
	children,
}: {
	tone?: Tone
	class?: string
	children: Snippet
} = $props()

const tones: Record<Tone, string> = {
	neutral: 'bg-raised text-body',
	accent: 'bg-accent/10 text-accent',
	success: 'bg-success/10 text-success',
	warning: 'bg-warning/10 text-warning',
	danger: 'bg-danger/10 text-danger',
	info: 'bg-info/10 text-info',
}
</script>

<span class="inline-flex items-center rounded-xs px-1.5 py-0.5 text-[11px] font-medium {tones[tone]} {className}">
	{@render children()}
</span>
