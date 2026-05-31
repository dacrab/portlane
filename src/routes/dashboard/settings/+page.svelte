<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const initials = $derived(
		(data.profile?.full_name ?? data.session?.user.email ?? '?')
			.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
	);
</script>

<div class="space-y-8">
	<div>
		<h1 class="page-title">Settings</h1>
		<p class="mt-1 text-sm" style="color:var(--color-text-muted)">Manage your account and preferences.</p>
	</div>

	<!-- Profile -->
	<div class="card max-w-lg space-y-5">
		<p class="card-label">Profile</p>

		<!-- Avatar -->
		<div class="flex items-center gap-4">
			<div class="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold"
				style="background:var(--color-accent-100);color:var(--color-accent-600)">{initials}</div>
			<div>
				<p class="text-sm font-medium" style="color:var(--color-text)">{data.profile?.full_name ?? 'No name set'}</p>
				<p class="text-xs" style="color:var(--color-text-faint)">{data.session?.user.email}</p>
			</div>
		</div>

		<form method="POST" action="?/update_profile" use:enhance class="space-y-4">
			{#if (form as any)?.profile_error}
				<p class="form-error">{(form as any).profile_error}</p>
			{/if}
			{#if (form as any)?.profile_saved}
				<p class="rounded-md px-3 py-2 text-sm" style="background:#f0fdf4;color:#15803d">Profile updated.</p>
			{/if}
			<div>
				<label for="full_name" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Full name</label>
				<input id="full_name" name="full_name" type="text" value={data.profile?.full_name ?? ''} class="input" />
			</div>
			<div>
				<label for="email_display" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Email</label>
				<input id="email_display" type="email" disabled value={data.session?.user.email ?? ''} class="input" />
				<p class="mt-1 text-xs" style="color:var(--color-text-faint)">Email cannot be changed here.</p>
			</div>
			<div class="pt-2" style="border-top:1px solid var(--color-border-subtle)">
				<button type="submit" class="btn btn-primary">Save changes</button>
			</div>
		</form>
	</div>

	<!-- Password -->
	<div class="card max-w-lg space-y-5">
		<p class="card-label">Change password</p>
		<form method="POST" action="?/change_password" use:enhance class="space-y-4">
			{#if (form as any)?.password_error}
				<p class="form-error">{(form as any).password_error}</p>
			{/if}
			{#if (form as any)?.password_saved}
				<p class="rounded-md px-3 py-2 text-sm" style="background:#f0fdf4;color:#15803d">Password updated.</p>
			{/if}
			<div>
				<label for="password" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">New password</label>
				<input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" class="input" placeholder="••••••••" />
			</div>
			<div>
				<label for="confirm" class="mb-1.5 block text-xs font-medium" style="color:var(--color-zinc-700)">Confirm password</label>
				<input id="confirm" name="confirm" type="password" required minlength="8" autocomplete="new-password" class="input" placeholder="••••••••" />
			</div>
			<div class="pt-2" style="border-top:1px solid var(--color-border-subtle)">
				<button type="submit" class="btn btn-primary">Update password</button>
			</div>
		</form>
	</div>

	<!-- Danger zone -->
	<div class="card max-w-lg space-y-4" style="border-color:#fecaca">
		<p class="card-label" style="color:#b91c1c">Danger zone</p>
		<p class="text-sm" style="color:var(--color-text-muted)">
			Permanently delete your account and all associated data. This cannot be undone.
		</p>
		<form method="POST" action="?/delete_account" use:enhance
			onsubmit={(e) => { if (!confirm('Delete your account? All projects, files, and data will be permanently removed.')) e.preventDefault(); }}>
			<button type="submit" class="btn" style="background:#fef2f2;color:#b91c1c;border:1px solid #fecaca">
				Delete account
			</button>
		</form>
	</div>
</div>
