<script lang="ts">
import type { Snippet } from 'svelte'

let {
	label,
	for: htmlFor,
	hint,
	error,
	optional = false,
	children,
}: {
	label: string
	for?: string
	hint?: string
	error?: string
	optional?: boolean
	children: Snippet
} = $props()
</script>

<div class="space-y-1.5">
	<label for={htmlFor} class="block text-[13px] font-medium text-body">
		{label}
		{#if optional}<span class="font-normal text-faint"> — optional</span>{/if}
	</label>
	{@render children()}
	{#if error}
		<p class="text-xs text-danger">{error}</p>
	{:else if hint}
		<p class="text-xs text-faint">{hint}</p>
	{/if}
</div>
