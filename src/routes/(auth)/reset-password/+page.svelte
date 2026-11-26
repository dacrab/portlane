<script lang="ts">
import { authClient, authError } from '#lib/auth-client.js'
import AuthCard from '#lib/components/AuthCard.svelte'
import { PASSWORD_MIN_LENGTH } from '#lib/constants.js'
import Button from '#lib/ui/Button.svelte'
import Field from '#lib/ui/Field.svelte'
import FormError from '#lib/ui/FormError.svelte'
import Input from '#lib/ui/Input.svelte'
import { goto } from '$app/navigation'
import { page } from '$app/state'

let password = $state('')
let confirm = $state('')
let error = $state('')
let loading = $state(false)

const token = $derived(page.url.searchParams.get('token') ?? '')
const invalidToken = $derived(
	page.url.searchParams.get('error') === 'INVALID_TOKEN',
)

async function submit(event: Event) {
	event.preventDefault()
	error = ''
	if (password !== confirm) {
		error = 'Passwords do not match'
		return
	}
	loading = true
	const { error: authFailure } = await authClient.resetPassword({
		newPassword: password,
		token,
	})
	loading = false
	if (authFailure) {
		error = authError(authFailure, 'Could not reset password')
		return
	}
	goto('/login')
}
</script>

<AuthCard>
	{#if invalidToken}
		<div>
			<h1 class="display text-[28px] leading-none">Invalid link</h1>
			<p class="mt-3 text-[13px] leading-relaxed text-muted">
				This password reset link is invalid or has expired.
			</p>
			<a href="/forgot-password" class="mt-6 inline-block text-xs font-medium text-accent hover:underline">
				Request a new link
			</a>
		</div>
	{:else if !token}
		<div>
			<h1 class="display text-[28px] leading-none">Open your email</h1>
			<p class="mt-3 text-[13px] leading-relaxed text-muted">
				Use the reset link from your inbox to set a new password.
			</p>
			<a href="/forgot-password" class="mt-6 inline-block text-xs font-medium text-accent hover:underline">
				Request a reset link
			</a>
		</div>
	{:else}
		<div class="mb-8">
			<h1 class="display text-[28px] leading-none">Set a new password</h1>
			<p class="mt-2 text-[13px] text-muted">Choose something you haven't used here before.</p>
		</div>

		<form onsubmit={submit} class="space-y-4">
			<FormError message={error} />

			<Field label="New password" for="password">
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

			<Field label="Confirm password" for="confirm">
				<Input
					id="confirm"
					type="password"
					bind:value={confirm}
					required
					minlength={PASSWORD_MIN_LENGTH}
					autocomplete="new-password"
					placeholder="Repeat your password"
				/>
			</Field>

			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Saving…' : 'Reset password'}
			</Button>

			<p class="pt-2 text-center text-xs text-muted">
				<a href="/login" class="font-medium text-accent hover:underline">Back to sign in</a>
			</p>
		</form>
	{/if}
</AuthCard>
