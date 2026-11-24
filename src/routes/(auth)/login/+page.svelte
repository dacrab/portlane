<script lang="ts">
import { authClient, authError } from '#lib/auth-client.js'
import AuthCard from '#lib/components/AuthCard.svelte'
import { goto } from '$app/navigation'

let email = $state('')
let password = $state('')
let error = $state('')
let loading = $state(false)
let needsVerification = $state(false)
let resending = $state(false)
let resent = $state(false)

async function submit(e: Event) {
	e.preventDefault()
	error = ''
	needsVerification = false
	resent = false
	loading = true
	const { error: err } = await authClient.signIn.email({ email, password })
	loading = false
	if (err) {
		needsVerification = err.code === 'EMAIL_NOT_VERIFIED'
		error = authError(err, 'Sign in failed')
		return
	}
	goto('/dashboard')
}

async function resendVerification() {
	error = ''
	resending = true
	const { error: err } = await authClient.sendVerificationEmail({
		email,
		callbackURL: '/dashboard',
	})
	resending = false
	if (err) {
		error = authError(err, 'Could not resend the verification email')
		return
	}
	resent = true
}
</script>

<AuthCard>
	<form onsubmit={submit} class="space-y-4">
		<h1 class="text-lg font-semibold text-center">Sign in</h1>
		{#if error}
			<p class="text-sm text-red-600 text-center">{error}</p>
		{/if}
		{#if needsVerification}
			{#if resent}
				<p class="text-sm text-center text-muted">Verification email sent. Check your inbox.</p>
			{:else}
				<button type="button" class="text-sm text-accent hover:underline" onclick={resendVerification} disabled={resending}>
					{resending ? 'Sending...' : 'Resend verification email'}
				</button>
			{/if}
		{/if}
		<div>
			<label for="email" class="input-label">Email</label>
			<input id="email" type="email" bind:value={email} required class="input" placeholder="your@email.com" />
		</div>
		<div>
			<label for="password" class="input-label">Password</label>
			<input id="password" type="password" bind:value={password} required class="input" placeholder="Password" />
		</div>
		<button type="submit" class="btn btn-primary w-full" disabled={loading}>
			{loading ? 'Signing in...' : 'Sign in'}
		</button>
		<p class="text-sm text-center text-faint">
			Don't have an account? <a href="/signup" class="text-accent hover:underline">Sign up</a>
		</p>
	</form>
</AuthCard>
