<script lang="ts">
	import type { Component } from 'svelte';

	let { icon: Icon, title, description, action, compact = false }: {
		icon?: Component;
		title: string;
		description: string;
		action?: { label: string; onClick?: () => void; href?: string };
		compact?: boolean;
	} = $props();
</script>

<div class="flex flex-col items-center justify-center px-6 {compact ? 'py-16' : 'py-20'} text-center">
	{#if Icon}
		<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-subtle">
			<span class="text-faint"><Icon class="h-6 w-6" /></span>
		</div>
	{/if}
	<p class="text-sm font-medium text-body">{title}</p>
	<p class="mt-1 text-xs text-faint">{description}</p>
	{#if action}
		{#if action.href}
			<a href={action.href} class="mt-4 btn btn-primary text-xs px-4">{action.label}</a>
		{:else}
			<button onclick={action.onClick} class="mt-4 btn btn-primary text-xs px-4">{action.label}</button>
		{/if}
	{/if}
</div>
