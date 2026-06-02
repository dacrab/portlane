<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="auth-page">
	<div class="w-full max-w-sm px-6">
		<a href="/" class="mb-8 flex items-center gap-2">
			<img src="/favicon.svg" alt="Portlane" class="h-7 w-7" />
			<span class="text-[15px] font-semibold tracking-tight text-heading">Portlane</span>
		</a>
		<h1 class="page-title mb-1 text-[22px]">New password</h1>
		<p class="mb-7 text-sm text-muted">Choose a strong password.</p>
		<form method="POST" use:enhance class="space-y-3">
			{#if form?.error}
				<p class="form-error">{form.error}</p>
			{/if}
			<div>
				<label for="password" class="mb-1.5 block text-xs font-medium text-label">New password</label>
				<input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" class="input" placeholder="••••••••" />
			</div>
			<button type="submit" class="btn btn-primary w-full justify-center py-2.5">Update password</button>
		</form>
	</div>
</div>
