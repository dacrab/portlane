<script lang="ts">
	import { Select } from 'bits-ui';
	import { beforeNavigate } from '$app/navigation';
	import IconCaretUpDownRegular from 'phosphor-icons-svelte/IconCaretUpDownRegular.svelte';
	import IconCheckRegular from 'phosphor-icons-svelte/IconCheckRegular.svelte';

	type Item = { value: string; label: string; disabled?: boolean };

	let {
		name,
		value = $bindable(''),
		items,
		placeholder = 'Select…',
		required = false,
		onchange,
	}: {
		name?: string;
		value?: string;
		items: Item[];
		placeholder?: string;
		required?: boolean;
		onchange?: (value: string) => void;
	} = $props();

	let open = $state(false);
	beforeNavigate(() => { open = false; });
</script>

<Select.Root
	type="single"
	name={name}
	{required}
	{items}
	bind:value
	bind:open
	onValueChange={onchange}
>
	<Select.Trigger class="app-select-trigger">
		<Select.Value {placeholder} />
		<span style="color:var(--color-text-faint)" class="ml-auto shrink-0"><IconCaretUpDownRegular class="h-3.5 w-3.5" /></span>
	</Select.Trigger>
	<Select.Portal disabled={false}>
		<Select.Content class="app-select-content" sideOffset={6}>
			<Select.Viewport class="app-select-viewport">
				{#each items as item (item.value)}
					<Select.Item class="app-select-item" value={item.value} label={item.label} disabled={item.disabled}>
						{#snippet children({ selected })}
							<span class="flex-1">{item.label}</span>
							{#if selected}
								<span style="color:var(--color-accent-600)" class="shrink-0"><IconCheckRegular class="h-3.5 w-3.5" /></span>
							{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
