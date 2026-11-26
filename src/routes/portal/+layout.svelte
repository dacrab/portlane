<script lang="ts">
import Logo from '#lib/ui/Logo.svelte'

let { data, children } = $props()
</script>

<div class="min-h-dvh bg-page">
	<header class="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-sm">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
			<Logo size="sm" href="/portal" />

			<div class="flex items-center gap-4">
				<span class="hidden truncate text-xs text-muted sm:block">{data.user?.email}</span>
				<form method="POST" action="/logout">
					<button type="submit" class="text-xs text-muted transition-colors hover:text-ink">
						Sign out
					</button>
				</form>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-6 py-10">
		{@render children()}
	</main>
</div>
