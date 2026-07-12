<script lang="ts">
import { page } from '$app/state'
</script>

<div class="auth-root">
	<div class="text-center">
		<p class="text-6xl font-800 tracking-tight text-heading">{page.status}</p>
		<p class="mt-3 text-sm text-muted">{page.error?.message ?? 'Something went wrong.'}</p>
		<a href="/dashboard" class="btn btn-primary mt-6 inline-flex">Go to dashboard</a>
	</div>
</div>
