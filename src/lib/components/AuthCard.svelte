<script lang="ts">
import type { Snippet } from 'svelte'

let { children }: { children: Snippet } = $props()
</script>

<div class="auth-root">
	<div class="auth-card">
		<a href="/" class="auth-logo">
			<img src="/favicon.svg" alt="Portlane" class="h-6 w-6" />
			Portlane
		</a>
		{@render children()}
	</div>
</div>
