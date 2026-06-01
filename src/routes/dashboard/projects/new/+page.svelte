<script lang="ts">
	import { enhance } from '$app/forms';
	import IconArrowLeftRegular from 'phosphor-icons-svelte/IconArrowLeftRegular.svelte';
	import type { ActionData } from './$types';
	import AppSelect from '$lib/components/AppSelect.svelte';
	import AppDatePicker from '$lib/components/AppDatePicker.svelte';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="space-y-8">
	<div class="flex items-center gap-3">
		<a href="/dashboard/projects" class="btn-icon shrink-0"><IconArrowLeftRegular class="h-[16px] w-[16px]" /></a>
		<div>
			<h1 class="page-title">New project</h1>
			<p class="mt-0.5 text-sm" style="color:var(--color-text-muted)">Fill in the details to get started.</p>
		</div>
	</div>

	<div class="card max-w-2xl">
		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ update }) => { loading = false; await update(); };
		}} class="space-y-5">
			{#if form?.error}
				<p class="form-error">{form.error}</p>
			{/if}

			<div>
				<label for="name" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Project name</label>
				<input id="name" name="name" type="text" required class="input" placeholder="Brand Redesign" />
			</div>

			<div>
				<label for="description" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">
					Description <span style="color:var(--color-text-faint)">(optional)</span>
				</label>
				<textarea id="description" name="description" rows="3" class="input resize-none" placeholder="Brief description of the project scope and goals…"></textarea>
			</div>

			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<p class="mb-1.5 text-xs font-medium" style="color:var(--color-zinc-700)">
						Due date <span style="color:var(--color-text-faint)">(optional)</span>
					</p>
					<AppDatePicker name="due_date" placeholder="Pick a due date" />
				</div>
				<div>
					<p class="mb-1.5 text-xs font-medium" style="color:var(--color-zinc-700)">Initial status</p>
					<AppSelect
						name="status"
						value="planning"
						items={[
							{ value: 'planning', label: 'Planning' },
							{ value: 'in_progress', label: 'In Progress' },
						]}
					/>
				</div>
			</div>

			<div class="flex items-center gap-3 pt-2" style="border-top:1px solid var(--color-border-subtle)">
				<button type="submit" disabled={loading} class="btn btn-primary">
					{loading ? 'Creating…' : 'Create project'}
				</button>
				<a href="/dashboard/projects" class="btn btn-ghost">Cancel</a>
			</div>
		</form>
	</div>
</div>
