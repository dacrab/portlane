<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	$effect(() => {
		if ((form as any)?.profile_saved) toast.success('Profile updated');
		if ((form as any)?.profile_error) toast.error((form as any).profile_error);
		if ((form as any)?.password_saved) toast.success('Password updated');
		if ((form as any)?.password_error) toast.error((form as any).password_error);
	});

	const initials = $derived(
		(data.profile?.full_name ?? data.email ?? '?')
			.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
	);

	function confirmDeleteAccount(form: HTMLFormElement) {
		toast('Delete your account?', {
			description: 'All projects, files, and data will be permanently removed. This cannot be undone.',
			action: { label: 'Delete account', onClick: () => form.requestSubmit() },
			cancel: { label: 'Cancel', onClick: () => {} },
			duration: 12000,
		});
	}
</script>

<div class="space-y-8">
	<div>
		<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">Account</p>
		<h1 class="page-title">Settings</h1>
		<p class="mt-0.5 text-sm text-muted">Manage your account and preferences.</p>
	</div>

	<!-- Profile + Password side by side -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Profile -->
		<div class="card space-y-5">
			<div class="flex items-center gap-4">
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold"
					style="background:var(--color-accent-100);color:var(--color-accent-600)">{initials}</div>
				<div>
					<p class="text-sm font-semibold text-heading">{data.profile?.full_name ?? 'No name set'}</p>
					<p class="text-xs text-faint">{data.email}</p>
				</div>
			</div>

			<form method="POST" action="?/update_profile"
				use:enhance={() => async ({ update }) => { await update(); }}
				class="space-y-4">
				<div>
					<label for="full_name" class="mb-1.5 block text-xs font-medium text-muted">Full name</label>
					<input id="full_name" name="full_name" type="text" value={data.profile?.full_name ?? ''} class="input" />
				</div>
				<div>
					<label for="email_display" class="mb-1.5 block text-xs font-medium text-muted">Email</label>
					<input id="email_display" type="email" disabled value={data.email} class="input" />
					<p class="mt-1 text-xs text-faint">Email cannot be changed here.</p>
				</div>
				<div class="pt-2 divide-top">
					<button type="submit" class="btn btn-primary">Save changes</button>
				</div>
			</form>
		</div>

		<!-- Password -->
		<div class="card space-y-5">
			<div>
				<p class="text-sm font-semibold text-heading">Change password</p>
				<p class="mt-0.5 text-xs text-faint">Choose a strong password of at least 8 characters.</p>
			</div>

			<form method="POST" action="?/change_password"
				use:enhance={() => async ({ update }) => { await update(); }}
				class="space-y-4">
				<div>
					<label for="password" class="mb-1.5 block text-xs font-medium text-muted">New password</label>
					<input id="password" name="password" type="password" required minlength="8" autocomplete="new-password" class="input" placeholder="••••••••" />
				</div>
				<div>
					<label for="confirm" class="mb-1.5 block text-xs font-medium text-muted">Confirm password</label>
					<input id="confirm" name="confirm" type="password" required minlength="8" autocomplete="new-password" class="input" placeholder="••••••••" />
				</div>
				<div class="pt-2 divide-top">
					<button type="submit" class="btn btn-primary">Update password</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Danger zone -->
	<div class="card card-danger space-y-4" style="max-width:42rem">
		<div>
			<p class="text-sm font-semibold text-danger">Danger zone</p>
			<p class="mt-0.5 text-sm text-muted">
				Permanently delete your account and all associated data. This cannot be undone.
			</p>
		</div>
		<form method="POST" action="?/delete_account"
			use:enhance={() => async ({ update }) => { await update(); }}>
			<button type="button" class="btn btn-danger"
				onclick={(e) => confirmDeleteAccount((e.currentTarget as HTMLElement).closest('form') as HTMLFormElement)}>
				Delete account
			</button>
		</form>
	</div>
</div>
