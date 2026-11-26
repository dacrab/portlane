<script lang="ts">
import type { Snippet } from 'svelte'
import Logo from '#lib/ui/Logo.svelte'

let { children }: { children: Snippet } = $props()

const lanes = [
	'Projects and milestones',
	'Files and approvals',
	'Invoices and payments',
]
</script>

<div class="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
	<aside class="hidden flex-col justify-between bg-ink p-12 text-page lg:flex">
		<Logo inverse href="/" />

		<div>
			<p class="display text-[44px] leading-[1.04] text-page">
				Client work,<br />in one lane.
			</p>
			<p class="mt-5 max-w-sm text-[13px] leading-relaxed text-page/60">
				A private workspace for every project — the timeline, the files, the
				approvals, and the invoice. One link for your client.
			</p>
		</div>

		<ul class="space-y-0">
			{#each lanes as lane, index (lane)}
				<li class="flex items-baseline gap-4 border-t border-page/15 py-3 text-[13px] text-page/70">
					<span class="w-5 tabular text-[11px] text-page/40">0{index + 1}</span>
					{lane}
				</li>
			{/each}
		</ul>
	</aside>

	<main class="flex items-center justify-center px-6 py-16">
		<div class="w-full max-w-sm">
			<div class="mb-10 lg:hidden">
				<Logo href="/" />
			</div>
			{@render children()}
		</div>
	</main>
</div>
