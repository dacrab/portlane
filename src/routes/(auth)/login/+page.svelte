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
			<span class="text-[15px] font-semibold tracking-tight" style="color:var(--color-text-heading)">Portlane</span>
		</a>

		<h1 class="page-title mb-1 text-[22px]">Welcome back</h1>
		<p class="mb-7 text-sm" style="color:var(--color-text-muted)">Sign in to your account</p>

		<form method="POST" use:enhance={() => {
			loading = true;
			return async ({ update }) => { loading = false; await update(); };
		}} class="space-y-3">
			{#if form?.error}
				<p class="form-error">{form.error}</p>
			{/if}

			<div>
				<label for="email" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Email</label>
				<input id="email" name="email" type="email" required autocomplete="email" class="input" placeholder="you@example.com" />
			</div>

			<div>
				<label for="password" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Password</label>
				<input id="password" name="password" type="password" required autocomplete="current-password" class="input" placeholder="••••••••" />
			</div>

			<button type="submit" disabled={loading} class="btn btn-primary w-full justify-center py-2.5">
				{loading ? 'Signing in…' : 'Sign in'}
			</button>
		</form>

		<p class="mt-5 text-center text-sm" style="color:var(--color-text-muted)">
			<a href="/forgot-password" style="color:var(--color-accent-600)">Forgot password?</a>
			· No account? <a href="/signup" class="font-medium" style="color:var(--color-accent-600)">Sign up</a>
		</p>
	</div>
</div>
