<script lang="ts">
import { enhance } from '$app/forms'
import type { ActionData } from './$types'

let { form }: { form: ActionData } = $props()
</script>

<div class="auth-root">
	<div class="auth-card">
		<a href="/" class="auth-logo">
			<img src="/favicon.svg" alt="Portlane" class="h-6 w-6" />
			Portlane
		</a>
		<div class="auth-header">
			<h1>New password</h1>
			<p>Choose a strong password of at least 8 characters.</p>
		</div>
		<form method="POST" use:enhance class="auth-form">
			{#if form?.error}<p class="form-error">{form.error}</p>{/if}
			<div class="auth-field">
				<label for="password">New password</label>
				<input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" class="input" placeholder="••••••••" />
			</div>
			<div class="auth-field">
				<label for="confirm">Confirm password</label>
				<input id="confirm" name="confirm" type="password" required minlength="8" autocomplete="new-password" class="input" placeholder="••••••••" />
			</div>
			<button type="submit" class="btn btn-primary auth-submit">Update password</button>
		</form>
	</div>
</div>
