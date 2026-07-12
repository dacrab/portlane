<script lang="ts">
import type { Component } from 'svelte'

let {
	title,
	count,
	icon: Icon,
	compact = false,
}: {
	title: string
	count?: string | number
	icon?: Component
	compact?: boolean
} = $props()
</script>

{#if compact}
	<p class="card-label {Icon ? 'flex items-center gap-2' : ''}">
		{#if Icon}<span class="text-faint"><Icon class="h-4 w-4" /></span>{/if}
		{title}
		{#if count !== undefined}
			<span class="ml-auto text-xs font-normal text-faint">{count}</span>
		{/if}
	</p>
{:else}
	<div class="flex items-center justify-between px-5 py-3.5 divide-bottom">
		<span class="section-label">{title}</span>
		{#if count !== undefined}
			<span class="text-xs text-faint">{count}</span>
		{/if}
	</div>
{/if}
