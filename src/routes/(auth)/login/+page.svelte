<script lang="ts">
import { authClient, authError } from '#lib/auth-client.js'
import AuthCard from '#lib/components/AuthCard.svelte'
import Button from '#lib/ui/Button.svelte'
import Field from '#lib/ui/Field.svelte'
import FormError from '#lib/ui/FormError.svelte'
import Input from '#lib/ui/Input.svelte'
import { goto } from '$app/navigation'

let email = $state('')
let password = $state('')
let error = $state('')
let loading = $state(false)
let needsVerification = $state(false)
let resending = $state(false)
let resent = $state(false)

async function submit(event: Event) {
	event.preventDefault()
	error = ''
	needsVerification = false
	resent = false
	loading = true
	const { error: authFailure } = await authClient.signIn.email({
		email,
		password,
	})
	loading = false
	if (authFailure) {
		needsVerification = authFailure.code === 'EMAIL_NOT_VERIFIED'
		error = authError(authFailure, 'Sign in failed')
		return
	}
	goto('/dashboard')
}

async function resendVerification() {
	error = ''
	resending = true
	const { error: authFailure } = await authClient.sendVerificationEmail({
		email,
		callbackURL: '/dashboard',
	})
	resending = false
	if (authFailure) {
		error = authError(authFailure, 'Could not resend the verification email')
		return
	}
	resent = true
}
</script>

<AuthCard>
	<div class="mb-8">
		<h1 class="display text-[28px] leading-none">Sign in</h1>
		<p class="mt-2 text-[13px] text-muted">Pick up where you left off.</p>
	</div>

	<form onsubmit={submit} class="space-y-4">
		<FormError message={error} />

		{#if needsVerification}
			<div class="rounded-md border border-line bg-raised px-3 py-2.5 text-xs text-body">
				{#if resent}
					Verification email sent. Check your inbox.
				{:else}
					Confirm your email first.
					<button
						type="button"
						class="font-medium text-accent hover:underline disabled:opacity-50"
						onclick={resendVerification}
						disabled={resending}
					>
						{resending ? 'Sending…' : 'Resend the link'}
					</button>
				{/if}
			</div>
		{/if}

		<Field label="Email" for="email">
			<Input id="email" type="email" bind:value={email} required autocomplete="email" placeholder="you@studio.com" />
		</Field>

		<Field label="Password" for="password">
			<Input id="password" type="password" bind:value={password} required autocomplete="current-password" placeholder="Your password" />
		</Field>

		<div class="-mt-1 text-right">
			<a href="/forgot-password" class="text-xs text-muted transition-colors hover:text-ink">
				Forgot password?
			</a>
		</div>

		<Button type="submit" disabled={loading} class="w-full">
			{loading ? 'Signing in…' : 'Sign in'}
		</Button>

		<p class="pt-2 text-center text-xs text-muted">
			No account?
			<a href="/signup" class="font-medium text-accent hover:underline">Create one</a>
		</p>
	</form>
</AuthCard>
