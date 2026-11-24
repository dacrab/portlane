<script lang="ts">
import { authClient, authError } from '#lib/auth-client.js'
import AuthCard from '#lib/components/AuthCard.svelte'

let name = $state('')
let email = $state('')
let password = $state('')
let error = $state('')
let loading = $state(false)
let sent = $state(false)

async function submit(e: Event) {
	e.preventDefault()
	error = ''
	loading = true
	const { error: err } = await authClient.signUp.email({
		name,
		email,
		password,
		callbackURL: '/dashboard',
	})
	loading = false
	if (err) {
		error = authError(err, 'Sign up failed')
		return
	}
	sent = true
}
</script>

<AuthCard>
	{#if sent}
		<div class="text-center space-y-2">
			<h1 class="text-lg font-semibold">Check your email</h1>
			<p class="text-sm text-muted">We sent a verification link to {email}. Open it to finish creating your account.</p>
			<a href="/login" class="text-accent text-sm hover:underline">Back to sign in</a>
		</div>
	{:else}
	<form onsubmit={submit} class="space-y-4">
		<h1 class="text-lg font-semibold text-center">Create an account</h1>
		{#if error}
			<p class="text-sm text-red-600 text-center">{error}</p>
		{/if}
		<div>
			<label for="name" class="input-label">Name</label>
			<input id="name" type="text" bind:value={name} required class="input" placeholder="Your name" />
		</div>
		<div>
			<label for="email" class="input-label">Email</label>
			<input id="email" type="email" bind:value={email} required class="input" placeholder="your@email.com" />
		</div>
		<div>
			<label for="password" class="input-label">Password</label>
			<input id="password" type="password" bind:value={password} required class="input" placeholder="Min 8 characters" />
		</div>
		<button type="submit" class="btn btn-primary w-full" disabled={loading}>
			{loading ? 'Creating account...' : 'Create account'}
		</button>
		<p class="text-sm text-center text-faint">
			Already have an account? <a href="/login" class="text-accent hover:underline">Sign in</a>
		</p>
	</form>
	{/if}
</AuthCard>
