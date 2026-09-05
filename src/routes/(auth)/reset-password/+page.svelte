<script lang="ts">
import { goto } from '$app/navigation'
import { page } from '$app/state'
import { authClient } from '$lib/auth-client'
import AuthCard from '$lib/components/AuthCard.svelte'
import { PASSWORD_MIN_LENGTH } from '$lib/constants'

let password = $state('')
let confirm = $state('')
let error = $state('')
let loading = $state(false)

const token = $derived(
	page.url.searchParams.get('token') &&
		page.url.searchParams.get('token') !== '',
)

const invalidToken = $derived(
	page.url.searchParams.get('error') === 'INVALID_TOKEN',
)

async function submit(e: Event) {
	e.preventDefault()
	error = ''
	if (password !== confirm) {
		error = 'Passwords do not match'
		return
	}
	loading = true
	const { error: err } = await authClient.resetPassword({
		newPassword: password,
		token: page.url.searchParams.get('token') ?? undefined,
	})
	loading = false
	if (err) {
		error = err.message ?? err.statusText ?? 'Could not reset password'
		return
	}
	goto('/login')
}
</script>

<AuthCard>
	{#if invalidToken}
		<div class="text-center space-y-2">
			<h1 class="text-lg font-semibold">Invalid reset link</h1>
			<p class="text-sm text-muted">This password reset link is invalid or has expired. Please request a new one.</p>
			<a href="/forgot-password" class="text-accent text-sm hover:underline">Request a new reset link</a>
		</div>
	{:else if !token}
		<div class="text-center space-y-2">
			<h1 class="text-lg font-semibold">Missing reset token</h1>
			<p class="text-sm text-muted">Open the reset link from your email to set a new password.</p>
			<a href="/forgot-password" class="text-accent text-sm hover:underline">Request a reset link</a>
		</div>
	{:else}
		<form onsubmit={submit} class="space-y-4">
			<h1 class="text-lg font-semibold text-center">Set a new password</h1>
			{#if error}
				<p class="text-sm text-red-600 text-center">{error}</p>
			{/if}
			<div>
				<label for="password" class="input-label">New password</label>
				<input id="password" type="password" bind:value={password} required minlength={PASSWORD_MIN_LENGTH} class="input" placeholder="Min 8 characters" />
			</div>
			<div>
				<label for="confirm" class="input-label">Confirm password</label>
				<input id="confirm" type="password" bind:value={confirm} required minlength={PASSWORD_MIN_LENGTH} class="input" placeholder="Repeat your password" />
			</div>
			<button type="submit" class="btn btn-primary w-full" disabled={loading}>
				{loading ? 'Saving...' : 'Reset password'}
			</button>
			<p class="text-sm text-center text-faint">
				<a href="/login" class="text-accent hover:underline">Back to sign in</a>
			</p>
		</form>
	{/if}
</AuthCard>
