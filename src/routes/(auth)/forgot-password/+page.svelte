<script lang="ts">
import { enhance } from '$app/forms'
import AuthCard from '$lib/components/AuthCard.svelte'
import type { ActionData } from './$types'

let { form }: { form: ActionData } = $props()
</script>

<AuthCard>
	{#if form?.sent}
		<div class="auth-header">
			<h1>Check your email</h1>
			<p>We sent a password reset link to your inbox.</p>
		</div>
		<a href="/login" class="btn btn-primary auth-submit" style="display:flex;justify-content:center">Back to login</a>
	{:else}
		<div class="auth-header">
			<h1>Reset your password</h1>
			<p>Enter your email and we'll send you a link.</p>
		</div>
		<form method="POST" use:enhance class="auth-form">
			{#if form?.error}<p class="form-error">{form.error}</p>{/if}
			<div class="auth-field">
				<label for="email">Email</label>
				<input id="email" name="email" type="email" required class="input" placeholder="you@example.com" />
			</div>
			<button type="submit" class="btn btn-primary auth-submit">Send reset link</button>
		</form>
		<p class="auth-footer"><a href="/login">Back to login</a></p>
	{/if}
</AuthCard>
