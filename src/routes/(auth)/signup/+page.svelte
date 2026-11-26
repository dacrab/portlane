<script lang="ts">
import { authClient, authError } from '#lib/auth-client.js'
import AuthCard from '#lib/components/AuthCard.svelte'
import { PASSWORD_MIN_LENGTH } from '#lib/constants.js'
import Button from '#lib/ui/Button.svelte'
import Field from '#lib/ui/Field.svelte'
import FormError from '#lib/ui/FormError.svelte'
import Input from '#lib/ui/Input.svelte'

let name = $state('')
let email = $state('')
let password = $state('')
let error = $state('')
let loading = $state(false)
let sent = $state(false)

async function submit(event: Event) {
	event.preventDefault()
	error = ''
	loading = true
	const { error: authFailure } = await authClient.signUp.email({
		name,
		email,
		password,
		callbackURL: '/dashboard',
	})
	loading = false
	if (authFailure) {
		error = authError(authFailure, 'Sign up failed')
		return
	}
	sent = true
}
</script>

<AuthCard>
	{#if sent}
		<div>
			<h1 class="display text-[28px] leading-none">Check your email</h1>
			<p class="mt-3 text-[13px] leading-relaxed text-muted">
				We sent a verification link to <span class="font-medium text-ink">{email}</span>.
				Open it to finish setting up your account.
			</p>
			<a href="/login" class="mt-6 inline-block text-xs font-medium text-accent hover:underline">
				Back to sign in
			</a>
		</div>
	{:else}
		<div class="mb-8">
			<h1 class="display text-[28px] leading-none">Create an account</h1>
			<p class="mt-2 text-[13px] text-muted">Your first project is a minute away.</p>
		</div>

		<form onsubmit={submit} class="space-y-4">
			<FormError message={error} />

			<Field label="Name" for="name">
				<Input id="name" type="text" bind:value={name} required autocomplete="name" placeholder="Your name" />
			</Field>

			<Field label="Email" for="email">
				<Input id="email" type="email" bind:value={email} required autocomplete="email" placeholder="you@studio.com" />
			</Field>

			<Field label="Password" for="password" hint="At least {PASSWORD_MIN_LENGTH} characters.">
				<Input
					id="password"
					type="password"
					bind:value={password}
					required
					minlength={PASSWORD_MIN_LENGTH}
					autocomplete="new-password"
					placeholder="Choose a password"
				/>
			</Field>

			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Creating account…' : 'Create account'}
			</Button>

			<p class="pt-2 text-center text-xs text-muted">
				Already have an account?
				<a href="/login" class="font-medium text-accent hover:underline">Sign in</a>
			</p>
		</form>
	{/if}
</AuthCard>
