<script lang="ts">
import { page } from '$app/state'

const signedIn = $derived(!!page.data.user)
const destination = $derived(signedIn ? '/dashboard' : '/')
const label = $derived(signedIn ? 'Go to dashboard' : 'Back home')
</script>

<div class="auth-root">
	<div class="text-center">
		<p class="text-6xl font-extrabold tracking-tight text-heading">{page.status}</p>
		<p class="mt-3 text-sm text-muted">{page.error?.message ?? 'Something went wrong.'}</p>
		<a href={destination} class="btn btn-primary mt-6 inline-flex">{label}</a>
	</div>
</div>
