<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<div class="auth-page">
	<div class="w-full max-w-sm px-6">
		<a href="/" class="mb-8 flex items-center gap-2">
			<img src="/favicon.svg" alt="Portlane" class="h-7 w-7" />
			<span class="text-[15px] font-semibold tracking-tight text-heading">Portlane</span>
		</a>

		<h1 class="page-title mb-1 text-[22px]">Create an account</h1>
		<p class="mb-7 text-sm text-muted">Start managing your clients today</p>

		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ update }) => { loading = false; await update(); };
		}} class="space-y-3">
			{#if form?.error}
				<p class="form-error">{form.error}</p>
			{/if}

			<div>
				<label for="full_name" class="mb-1.5 block text-xs font-medium text-label">Full name</label>
				<input id="full_name" name="full_name" type="text" required autocomplete="name" class="input" placeholder="Alex Rivera" />
			</div>

			<div>
				<label for="email" class="mb-1.5 block text-xs font-medium text-label">Email</label>
				<input id="email" name="email" type="email" required autocomplete="email" class="input" placeholder="you@example.com" />
			</div>

			<div>
				<label for="password" class="mb-1.5 block text-xs font-medium text-label">Password</label>
				<input id="password" name="password" type="password" required autocomplete="new-password" minlength="8" class="input" placeholder="••••••••" />
			</div>

			<button type="submit" disabled={loading} class="btn btn-primary w-full justify-center py-2.5">
				{loading ? 'Creating account…' : 'Create account'}
			</button>
		</form>

		<p class="mt-5 text-center text-sm text-muted">
			Already have an account? <a href="/login" class="font-medium text-accent">Sign in</a>
		</p>
	</div>
</div>
