<script lang="ts">
import { enhance } from '$app/forms'
import AuthCard from '$lib/components/AuthCard.svelte'
import type { ActionData } from './$types'

let { form }: { form: ActionData } = $props()
let loading = $state(false)
</script>

<AuthCard>
	<div class="auth-header">
		<h1>Welcome back</h1>
		<p>Sign in to your account</p>
	</div>
	<form method="POST" use:enhance={() => {
		loading = true;
		return async ({ update }) => { loading = false; await update(); };
	}} class="auth-form">
		{#if form?.error}<p class="form-error">{form.error}</p>{/if}
		<div class="auth-field">
			<label for="email">Email</label>
			<input id="email" name="email" type="email" required autocomplete="email" class="input" placeholder="you@example.com" />
		</div>
		<div class="auth-field">
			<label for="password">Password</label>
			<input id="password" name="password" type="password" required autocomplete="current-password" class="input" placeholder="••••••••" />
		</div>
		<button type="submit" disabled={loading} class="btn btn-primary auth-submit">
			{loading ? 'Signing in…' : 'Sign in'}
		</button>
	</form>
	<p class="auth-footer">
		<a href="/forgot-password">Forgot password?</a>
		<span>·</span>
		<span>No account? <a href="/signup">Sign up free</a></span>
	</p>
</AuthCard>
