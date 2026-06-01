<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="auth-page">
	<div class="w-full max-w-sm px-6 text-center">
		<p class="text-5xl font-bold tracking-tight" style="color:var(--color-text-heading)">{page.status}</p>
		<p class="mt-3 text-sm" style="color:var(--color-text-muted)">{page.error?.message ?? 'Something went wrong.'}</p>
		<a href="/dashboard" class="btn btn-primary mt-6 inline-flex">Go to dashboard</a>
	</div>
</div>
