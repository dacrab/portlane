<script lang="ts">
	import { DatePicker } from 'bits-ui';
	import { parseDate, type DateValue } from '@internationalized/date';
	import IconCalendarRegular from 'phosphor-icons-svelte/IconCalendarRegular.svelte';
	import IconCaretLeftRegular from 'phosphor-icons-svelte/IconCaretLeftRegular.svelte';
	import IconCaretRightRegular from 'phosphor-icons-svelte/IconCaretRightRegular.svelte';

	let {
		name,
		value = $bindable(''),
		placeholder = 'Pick a date',
	}: {
		name: string;
		value?: string;
		placeholder?: string;
	} = $props();

	let calValue = $state<DateValue | undefined>(value ? parseDate(value) : undefined);
</script>

<input type="hidden" {name} value={value} />

<DatePicker.Root bind:value={calValue} onValueChange={(v) => { value = v ? v.toString() : ''; }} locale="en-US">
	<DatePicker.Trigger class="app-select-trigger">
		<span class="flex-1 text-left" style="color:{calValue ? 'var(--color-text)' : 'var(--color-zinc-300)'}">
			{calValue
				? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
				: placeholder}
		</span>
		<span class="text-faint ml-auto shrink-0"><IconCalendarRegular class="h-3.5 w-3.5" /></span>
	</DatePicker.Trigger>
	<DatePicker.Content class="app-calendar-content" sideOffset={6}>
		<DatePicker.Calendar class="app-calendar">
			{#snippet children({ months, weekdays })}
				<DatePicker.Header class="app-calendar-header">
					<DatePicker.PrevButton class="app-cal-nav">
						<IconCaretLeftRegular class="h-3.5 w-3.5" />
					</DatePicker.PrevButton>
					<DatePicker.Heading class="app-calendar-heading" />
					<DatePicker.NextButton class="app-cal-nav">
						<IconCaretRightRegular class="h-3.5 w-3.5" />
					</DatePicker.NextButton>
				</DatePicker.Header>
				{#each months as month}
					<DatePicker.Grid class="app-calendar-grid">
						<DatePicker.GridHead>
							<DatePicker.GridRow class="app-calendar-weekdays">
								{#each weekdays as day}
									<DatePicker.HeadCell class="app-calendar-weekday">{day.slice(0, 2)}</DatePicker.HeadCell>
								{/each}
							</DatePicker.GridRow>
						</DatePicker.GridHead>
						<DatePicker.GridBody>
							{#each month.weeks as week}
								<DatePicker.GridRow>
									{#each week as date}
										<DatePicker.Cell {date} month={month.value}>
											<DatePicker.Day class="app-calendar-day" />
										</DatePicker.Cell>
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
