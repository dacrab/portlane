<script lang="ts">
import { Select } from 'bits-ui'
import IconCaretUpDownRegular from 'phosphor-icons-svelte/IconCaretUpDownRegular.svelte'
import IconCheckRegular from 'phosphor-icons-svelte/IconCheckRegular.svelte'
import { beforeNavigate } from '$app/navigation'

type Item = { value: string; label: string; disabled?: boolean }

let {
	name,
	value = $bindable(''),
	items,
	placeholder = 'Select',
	required = false,
	onchange,
}: {
	name?: string
	value?: string
	items: Item[]
	placeholder?: string
	required?: boolean
	onchange?: (value: string) => void
} = $props()

let open = $state(false)

beforeNavigate(({ shallow, type }) => {
	if (shallow && type === 'goto') return
	open = false
})
</script>

<Select.Root
	type="single"
	{name}
	{required}
	{items}
	bind:value
	bind:open
	onValueChange={onchange}
>
	<Select.Trigger class="flex h-9 w-full items-center gap-2 rounded-md border border-line bg-surface px-3 text-left text-[13px] text-ink transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 data-[placeholder]:text-faint">
		<Select.Value {placeholder} />
		<span class="ml-auto shrink-0 text-faint"><IconCaretUpDownRegular class="h-3.5 w-3.5" /></span>
	</Select.Trigger>
	<Select.Portal>
		<Select.Content class="z-50 min-w-[var(--bits-select-anchor-width)] overflow-hidden rounded-lg border border-line bg-surface p-1 shadow-[var(--shadow-float)]" sideOffset={6}>
			<Select.Viewport class="max-h-64 overflow-y-auto scroll-thin">
				{#each items as item (item.value)}
					<Select.Item
						class="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] text-body outline-none transition-colors data-[disabled]:opacity-40 data-[highlighted]:bg-raised data-[highlighted]:text-ink data-[selected]:text-ink"
						value={item.value}
						label={item.label}
						disabled={item.disabled}
					>
						{#snippet children({ selected })}
							<span class="flex-1">{item.label}</span>
							{#if selected}
								<span class="shrink-0 text-accent"><IconCheckRegular class="h-3.5 w-3.5" /></span>
							{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
