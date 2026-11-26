<script lang="ts">
import Button from '#lib/ui/Button.svelte'
import { page } from '$app/state'

const signedIn = $derived(!!page.data.user)
const destination = $derived(signedIn ? '/dashboard' : '/')
const label = $derived(signedIn ? 'Go to dashboard' : 'Back home')
</script>

<svelte:head>
	<title>{page.status} · Portlane</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center px-6">
	<div class="max-w-md text-center">
		<p class="display text-[72px] leading-none text-ink">{page.status}</p>
		<p class="mt-4 text-[13px] leading-relaxed text-muted">
			{page.error?.message ?? 'Something went wrong.'}
		</p>
		<div class="mt-7 flex justify-center">
			<Button href={destination} size="sm">{label}</Button>
		</div>
	</div>
</div>
