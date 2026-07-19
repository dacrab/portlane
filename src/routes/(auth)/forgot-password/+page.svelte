<script lang="ts">
import { authClient } from '$lib/auth-client'
import AuthCard from '$lib/components/AuthCard.svelte'

let email = $state('')
let sent = $state(false)
let error = $state('')
let loading = $state(false)

async function submit(e: Event) {
	e.preventDefault()
	error = ''
	loading = true
	// @ts-expect-error - better-auth client types don't include email/password methods on the svelte wrapper
	const { error: err } = await authClient.forgetPassword({
		email,
		redirectTo: '/reset-password',
	})
	loading = false
	if (err) {
		error = err.message ?? err.statusText ?? 'Request failed'
		return
	}
	sent = true
}
</script>

<AuthCard>
	{#if sent}
		<div class="text-center space-y-2">
			<h1 class="text-lg font-semibold">Check your email</h1>
			<p class="text-sm text-muted">If an account exists for {email}, you'll receive a reset link shortly.</p>
			<a href="/login" class="text-accent text-sm hover:underline">Back to sign in</a>
		</div>
	{:else}
		<form onsubmit={submit} class="space-y-4">
			<h1 class="text-lg font-semibold text-center">Reset password</h1>
			{#if error}
				<p class="text-sm text-red-600 text-center">{error}</p>
			{/if}
			<div>
				<label for="email" class="input-label">Email</label>
				<input id="email" type="email" bind:value={email} required class="input" placeholder="your@email.com" />
			</div>
			<button type="submit" class="btn btn-primary w-full" disabled={loading}>
				{loading ? 'Sending...' : 'Send reset link'}
			</button>
			<p class="text-sm text-center text-faint">
				<a href="/login" class="text-accent hover:underline">Back to sign in</a>
			</p>
		</form>
	{/if}
</AuthCard>
