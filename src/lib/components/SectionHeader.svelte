<script lang="ts">
import type { Component } from 'svelte'

let {
	title,
	count,
	icon: Icon,
}: {
	title: string
	count?: string | number
	icon?: Component
} = $props()
</script>

<div class="flex items-center justify-between px-5 py-3.5 divide-bottom">
	<span class="section-label {Icon ? 'flex items-center gap-2' : ''}">
		{#if Icon}<span class="text-faint"><Icon class="h-4 w-4" /></span>{/if}
		{title}
	</span>
	{#if count !== undefined}
		<span class="text-xs text-faint">{count}</span>
	{/if}
</div>
