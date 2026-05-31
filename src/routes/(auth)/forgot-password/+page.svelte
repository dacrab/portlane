<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<div class="auth-page">
	<div class="w-full max-w-sm px-6">
		<a href="/" class="mb-8 flex items-center gap-2">
			<img src="/favicon.svg" alt="Portlane" class="h-7 w-7" />
			<span class="text-[15px] font-semibold tracking-tight" style="color:var(--color-text-heading)">Portlane</span>
		</a>

		<h1 class="page-title mb-1 text-[22px]">Reset password</h1>
		<p class="mb-7 text-sm" style="color:var(--color-text-muted)">We'll send you a reset link.</p>

		{#if (form as any)?.sent}
			<p class="rounded-md px-3 py-2.5 text-sm" style="background:#f0fdf4;color:#15803d">
				Check your email for a reset link.
			</p>
			<p class="mt-4 text-center text-sm" style="color:var(--color-text-muted)">
				<a href="/login" style="color:var(--color-accent-600)">Back to login</a>
			</p>
		{:else}
			<form method="POST" use:enhance class="space-y-3">
				{#if form?.error}
					<p class="form-error">{form.error}</p>
				{/if}
				<div>
					<label for="email" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Email</label>
					<input id="email" name="email" type="email" required class="input" placeholder="you@example.com" />
				</div>
				<button type="submit" class="btn btn-primary w-full justify-center py-2.5">Send reset link</button>
			</form>
			<p class="mt-5 text-center text-sm" style="color:var(--color-text-muted)">
				<a href="/login" style="color:var(--color-accent-600)">Back to login</a>
			</p>
		{/if}
	</div>
</div>
