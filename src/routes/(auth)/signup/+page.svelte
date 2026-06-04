<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '$lib/components/AuthCard.svelte';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
</script>

<AuthCard>
	<div class="auth-header">
		<h1>Create an account</h1>
		<p>Start managing your clients today — free.</p>
	</div>
	<form method="POST" use:enhance={() => {
		loading = true;
		return async ({ update }) => { loading = false; await update(); };
	}} class="auth-form">
		{#if form?.error}<p class="form-error">{form.error}</p>{/if}
		<div class="auth-field">
			<label for="full_name">Full name</label>
			<input id="full_name" name="full_name" type="text" required autocomplete="name" class="input" placeholder="Alex Rivera" />
		</div>
		<div class="auth-field">
			<label for="email">Email</label>
			<input id="email" name="email" type="email" required autocomplete="email" class="input" placeholder="you@example.com" />
		</div>
		<div class="auth-field">
			<label for="password">Password</label>
			<input id="password" name="password" type="password" required autocomplete="new-password" minlength="8" class="input" placeholder="Min. 8 characters" />
		</div>
		<button type="submit" disabled={loading} class="btn btn-primary auth-submit">
			{loading ? 'Creating account…' : 'Create account'}
		</button>
	</form>
	<p class="auth-footer">Already have an account? <a href="/login">Sign in</a></p>
</AuthCard>
