<script lang="ts">
import Avatar from '$lib/components/Avatar.svelte'
import ProjectDetailView from '$lib/components/ProjectDetailView.svelte'
import ProjectListView from '$lib/components/ProjectListView.svelte'
import type { PageData } from './$types'

let { data }: { data: PageData } = $props()
</script>

<div class="min-h-screen" style="background:var(--color-bg);font-family:var(--font-sans)">
	<!-- Nav -->
	<header class="sticky top-0 z-40"
		style="background:color-mix(in srgb, var(--color-bg-elevated) 90%, transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--color-border)">
		<div class="mx-auto flex h-13 max-w-[72rem] items-center justify-between px-6">
			<div class="flex items-center gap-2">
				<img src="/favicon.svg" alt="Portlane" class="h-5 w-5" />
				<span class="text-sm font-semibold tracking-tight text-heading">Portlane</span>
				{#if data.project}
					<span class="text-faint">/</span>
					<span class="text-sm text-muted truncate max-w-48">{data.project.name}</span>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				{#if data.project}
					<a href="/portal" class="text-xs text-faint hover:text-heading transition-colors">← All projects</a>
				{/if}
				<div class="flex items-center gap-2 pl-3" style="border-left:1px solid var(--color-border)">
					<Avatar name={data.user?.email ?? '?'} size={7} />
					<form method="POST" action="/logout">
						<button type="submit" class="text-xs text-faint hover:text-heading transition-colors">Log out</button>
					</form>
				</div>
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-[72rem] px-6 py-8">

		{#if !data.project}
			<ProjectListView {data} />
		{:else}
			<ProjectDetailView {data} />
		{/if}

	</div>
</div>
