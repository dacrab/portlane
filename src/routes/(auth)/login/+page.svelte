<script lang="ts">
import { goto } from '$app/navigation'
import { authClient } from '$lib/auth-client'
import AuthCard from '$lib/components/AuthCard.svelte'

let email = $state('')
let password = $state('')
let error = $state('')
let loading = $state(false)

async function submit(e: Event) {
	e.preventDefault()
	error = ''
	loading = true
	const { error: err } = await authClient.signIn.email({ email, password })
	loading = false
	if (err) {
		error = err.message ?? err.statusText ?? 'Sign in failed'
		return
	}
	goto('/dashboard')
}
</script>

<AuthCard>
	<form onsubmit={submit} class="space-y-4">
		<h1 class="text-lg font-semibold text-center">Sign in</h1>
		{#if error}
			<p class="text-sm text-red-600 text-center">{error}</p>
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
