<script lang="ts">
	import { enhance } from '$app/forms';
	import IconArrowLeftRegular from 'phosphor-icons-svelte/IconArrowLeftRegular.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="space-y-8">
	<div class="flex items-center gap-3">
		<a href="/dashboard/projects" class="btn-icon"><IconArrowLeftRegular class="h-[16px] w-[16px]" /></a>
		<div>
			<h1 class="page-title">New project</h1>
			<p class="mt-1 text-sm" style="color:var(--color-text-muted)">Fill in the details to get started.</p>
		</div>
	</div>

	<div class="card max-w-lg space-y-5">
		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ update }) => { loading = false; await update(); };
		}} class="space-y-4">
			{#if form?.error}
				<p class="form-error">{form.error}</p>
			{/if}
			<div>
				<label for="name" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Project name</label>
				<input id="name" name="name" type="text" required class="input" placeholder="Brand Redesign" />
			</div>
			<div>
				<label for="description" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Description <span style="color:var(--color-text-faint)">(optional)</span></label>
				<textarea id="description" name="description" rows="3" class="input resize-none" placeholder="Brief description…"></textarea>
			</div>
			<div>
				<label for="due_date" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Due date <span style="color:var(--color-text-faint)">(optional)</span></label>
				<input id="due_date" name="due_date" type="date" class="input" />
			</div>
			<div class="pt-2" style="border-top:1px solid var(--color-border-subtle)">
				<button type="submit" disabled={loading} class="btn btn-primary">
					{loading ? 'Creating…' : 'Create project'}
				</button>
			</div>
		</form>
	</div>
</div>
