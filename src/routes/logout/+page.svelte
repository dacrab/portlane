<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<div class="auth-page">
	<div class="w-full max-w-sm px-6 text-center">
		<img src="/favicon.svg" alt="Portlane" class="mx-auto mb-6 h-10 w-10" />
		<p class="text-sm text-muted">Signing you out…</p>
		<form method="POST" class="mt-4" use:enhance>
			<button type="submit" class="btn btn-primary">Sign out now</button>
		</form>
	</div>
</div>
