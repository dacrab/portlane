<script lang="ts">
import { toast } from 'svelte-sonner'
import { PASSWORD_MIN_LENGTH } from '#lib/constants.js'
import Avatar from '#lib/ui/Avatar.svelte'
import Button from '#lib/ui/Button.svelte'
import Field from '#lib/ui/Field.svelte'
import Input from '#lib/ui/Input.svelte'
import PageHeader from '#lib/ui/PageHeader.svelte'
import Section from '#lib/ui/Section.svelte'
import { enhance } from '$app/forms'
import type { ActionData, PageData } from './$types'

let { data, form }: { data: PageData; form: ActionData } = $props()

$effect(() => {
	if (form?.profile_saved) toast.success('Profile updated')
	if (typeof form?.profile_error === 'string') toast.error(form.profile_error)
	if (form?.password_saved) toast.success('Password updated')
	if (typeof form?.password_error === 'string') toast.error(form.password_error)
})

let deleteForm: HTMLFormElement

function confirmDeleteAccount() {
	toast('Delete your account?', {
		description:
			'All projects, files, and data will be permanently removed. This cannot be undone.',
		action: {
			label: 'Delete account',
			onClick: () => deleteForm.requestSubmit(),
		},
		cancel: { label: 'Cancel', onClick: () => {} },
		duration: 12000,
	})
}
</script>

<div class="space-y-8">
	<PageHeader title="Settings" description="Your account and sign-in details." />

	<div class="grid items-start gap-6 lg:grid-cols-2">
		<Section title="Profile">
			<div class="mb-6 flex items-center gap-4">
				<Avatar name={data.profile?.name ?? data.email ?? '?'} size={11} />
				<div class="min-w-0">
					<p class="truncate text-[13px] font-medium text-ink">
						{data.profile?.name ?? 'No name set'}
					</p>
					<p class="truncate text-[11px] text-muted">{data.email}</p>
				</div>
			</div>

			<form method="POST" action="?/update_profile" use:enhance class="space-y-4">
				<Field label="Full name" for="name">
					<Input id="name" name="name" type="text" required value={data.profile?.name ?? ''} />
				</Field>
				<Field label="Email" for="email-display" hint="Email cannot be changed here.">
					<Input id="email-display" type="email" disabled value={data.email} />
				</Field>
				<div class="border-t border-line pt-4">
					<Button type="submit" size="sm">Save changes</Button>
				</div>
			</form>
		</Section>

		<Section title="Password">
			<p class="mb-5 text-[13px] leading-relaxed text-muted">
				Use at least {PASSWORD_MIN_LENGTH} characters. Changing it signs out other sessions.
			</p>

			<form method="POST" action="?/change_password" use:enhance class="space-y-4">
				<Field label="Current password" for="current-password">
					<Input
						id="current-password"
						name="current_password"
						type="password"
						required
						autocomplete="current-password"
					/>
				</Field>
				<Field label="New password" for="new-password">
					<Input
						id="new-password"
						name="password"
						type="password"
						required
						minlength={PASSWORD_MIN_LENGTH}
						autocomplete="new-password"
					/>
				</Field>
				<Field label="Confirm password" for="confirm-password">
					<Input
						id="confirm-password"
						name="confirm"
						type="password"
						required
						minlength={PASSWORD_MIN_LENGTH}
						autocomplete="new-password"
					/>
				</Field>
				<div class="border-t border-line pt-4">
					<Button type="submit" size="sm">Update password</Button>
				</div>
			</form>
		</Section>
	</div>

	<Section title="Delete account" class="max-w-2xl">
		<p class="text-[13px] leading-relaxed text-muted">
			Permanently removes your account, projects, files, and invoices. This cannot be undone.
		</p>
		<form bind:this={deleteForm} method="POST" action="?/delete_account" use:enhance class="mt-4">
			<Button type="button" variant="danger" size="sm" onclick={confirmDeleteAccount}>
				Delete account
			</Button>
		</form>
	</Section>
</div>
