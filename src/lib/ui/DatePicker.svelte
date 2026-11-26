<script lang="ts">
import { type DateValue, parseDate } from '@internationalized/date'
import { DatePicker } from 'bits-ui'
import IconCalendarRegular from 'phosphor-icons-svelte/IconCalendarRegular.svelte'
import IconCaretLeftRegular from 'phosphor-icons-svelte/IconCaretLeftRegular.svelte'
import IconCaretRightRegular from 'phosphor-icons-svelte/IconCaretRightRegular.svelte'
import { LOCALE } from '#lib/constants.js'
import { formatDateYear } from '#lib/domain/format.js'

let {
	name,
	value = $bindable(''),
	placeholder = 'Pick a date',
}: {
	name: string
	value?: string
	placeholder?: string
} = $props()

let calValue = $state<DateValue | undefined>(
	value ? parseDate(value) : undefined,
)
</script>

<input type="hidden" {name} value={value} />

<DatePicker.Root
	bind:value={calValue}
	onValueChange={(next) => {
		value = next ? next.toString() : ''
	}}
	locale={LOCALE}
>
	<DatePicker.Trigger class="flex h-9 w-full items-center gap-2 rounded-md border border-line bg-surface px-3 text-left text-[13px] transition-colors duration-150 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20">
		<span class="flex-1 {calValue ? 'text-ink' : 'text-faint'}">
			{calValue ? formatDateYear(value) : placeholder}
		</span>
		<span class="ml-auto shrink-0 text-faint"><IconCalendarRegular class="h-3.5 w-3.5" /></span>
	</DatePicker.Trigger>
	<DatePicker.Content class="z-50 rounded-lg border border-line bg-surface p-3 shadow-[var(--shadow-float)]" sideOffset={6}>
		<DatePicker.Calendar class="w-full">
			{#snippet children({ months, weekdays })}
				<DatePicker.Header class="mb-3 flex items-center justify-between">
					<DatePicker.PrevButton class="flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-ink">
						<IconCaretLeftRegular class="h-3.5 w-3.5" />
					</DatePicker.PrevButton>
					<DatePicker.Heading class="text-[13px] font-medium text-ink" />
					<DatePicker.NextButton class="flex h-7 w-7 items-center justify-center rounded-md text-faint transition-colors hover:bg-raised hover:text-ink">
						<IconCaretRightRegular class="h-3.5 w-3.5" />
					</DatePicker.NextButton>
				</DatePicker.Header>
				{#each months as month}
					<DatePicker.Grid class="w-full">
						<DatePicker.GridHead>
							<DatePicker.GridRow class="grid grid-cols-7">
								{#each weekdays as day}
									<DatePicker.HeadCell class="pb-2 text-center text-[11px] font-medium text-faint">
										{day.slice(0, 2)}
									</DatePicker.HeadCell>
								{/each}
							</DatePicker.GridRow>
						</DatePicker.GridHead>
						<DatePicker.GridBody>
							{#each month.weeks as week}
								<DatePicker.GridRow class="grid grid-cols-7">
									{#each week as date}
										<DatePicker.Cell
											{date}
											month={month.value}
											class="flex h-8 w-8 items-center justify-center rounded-md text-[13px] text-body transition-colors hover:bg-raised data-[disabled]:opacity-30 data-[outside-month]:opacity-40 data-[selected]:bg-ink data-[selected]:text-page data-[today]:font-medium data-[today]:text-accent"
										/>
									{/each}
								</DatePicker.GridRow>
							{/each}
						</DatePicker.GridBody>
					</DatePicker.Grid>
				{/each}
			{/snippet}
		</DatePicker.Calendar>
	</DatePicker.Content>
</DatePicker.Root>
