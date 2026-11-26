<script lang="ts">
import { authClient, authError } from '#lib/auth-client.js'
import AuthCard from '#lib/components/AuthCard.svelte'
import Button from '#lib/ui/Button.svelte'
import Field from '#lib/ui/Field.svelte'
import FormError from '#lib/ui/FormError.svelte'
import Input from '#lib/ui/Input.svelte'

let email = $state('')
let sent = $state(false)
let error = $state('')
let loading = $state(false)

async function submit(event: Event) {
	event.preventDefault()
	error = ''
	loading = true
	const { error: authFailure } = await authClient.requestPasswordReset({
		email,
		redirectTo: '/reset-password',
	})
	loading = false
	if (authFailure) {
		error = authError(authFailure, 'Request failed')
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
				If an account exists for <span class="font-medium text-ink">{email}</span>,
				a reset link is on its way.
			</p>
			<a href="/login" class="mt-6 inline-block text-xs font-medium text-accent hover:underline">
				Back to sign in
			</a>
		</div>
	{:else}
		<div class="mb-8">
			<h1 class="display text-[28px] leading-none">Reset password</h1>
			<p class="mt-2 text-[13px] text-muted">We'll email you a link to set a new one.</p>
		</div>

		<form onsubmit={submit} class="space-y-4">
			<FormError message={error} />

			<Field label="Email" for="email">
				<Input id="email" type="email" bind:value={email} required autocomplete="email" placeholder="you@studio.com" />
			</Field>

			<Button type="submit" disabled={loading} class="w-full">
				{loading ? 'Sending…' : 'Send reset link'}
			</Button>

			<p class="pt-2 text-center text-xs text-muted">
				<a href="/login" class="font-medium text-accent hover:underline">Back to sign in</a>
			</p>
		</form>
	{/if}
</AuthCard>
