<script lang="ts">
	import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte';

	const features = [
		{ title: 'Project Tracking', desc: 'Milestones, tasks, and timelines — all in one place.' },
		{ title: 'Invoicing', desc: 'Send invoices and get paid without leaving the app.' },
		{ title: 'Client Portals', desc: 'Each client gets their own private, branded portal.' },
	];
</script>

<div class="min-h-screen" style="background:var(--color-bg-elevated);color:var(--color-text)">
	<header class="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
		<a href="/" class="flex items-center gap-2">
			<img src="/favicon.svg" alt="Portlane" class="h-7 w-7" />
			<span class="text-[15px] font-semibold tracking-tight text-heading">Portlane</span>
		</a>
		<nav class="flex items-center gap-6">
			<a href="/login" class="text-sm transition-colors text-muted">Log in</a>
			<a href="/dashboard" class="btn btn-primary rounded-full px-5 py-2">Get started</a>
		</nav>
	</header>

	<section class="mx-auto max-w-5xl px-6 pt-24 pb-20">
		<p class="mb-5 text-sm font-medium text-accent">For freelancers &amp; studios</p>
		<h1 class="max-w-2xl text-[56px] font-bold leading-[1.08] tracking-[-0.03em] text-heading">
			Your clients deserve<br>a better experience.
		</h1>
		<p class="mt-6 max-w-lg text-[17px] leading-relaxed" style="color:var(--color-zinc-600)">
			Replace messy email threads and Drive folders with a clean, professional portal your clients will actually love.
		</p>
		<div class="mt-9 flex items-center gap-4">
			<a href="/dashboard" class="btn btn-accent rounded-full px-5 py-2.5 text-sm font-semibold">
				Start for free <IconArrowRightRegular class="h-[15px] w-[15px]" />
			</a>
			<a href="#features" class="text-sm transition-colors text-muted">See how it works →</a>
		</div>
	</section>

	<div class="mx-auto max-w-5xl px-6"><div class="divider"></div></div>

	<section id="features" class="mx-auto max-w-5xl px-6 py-20">
		<div class="grid gap-12 md:grid-cols-3">
			{#each features as f, i}
				<div>
					<div class="mb-3 text-xs font-semibold uppercase tracking-widest text-faint">0{i + 1}</div>
					<h3 class="mb-2 text-[15px] font-semibold text-heading">{f.title}</h3>
					<p class="text-sm leading-relaxed text-muted">{f.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<div class="mx-auto max-w-5xl px-6"><div class="divider"></div></div>

	<section class="mx-auto max-w-5xl px-6 py-24">
		<div class="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
			<div>
				<h2 class="text-[36px] font-bold leading-tight tracking-[-0.02em] text-heading">
					Ready to impress<br>your clients?
				</h2>
				<p class="mt-3 text-muted">Set up your first project in under 5 minutes.</p>
			</div>
			<a href="/dashboard" class="btn btn-accent shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold">
				Get started free <IconArrowRightRegular class="h-[15px] w-[15px]" />
			</a>
		</div>
	</section>

	<footer class="py-6 text-center text-xs" style="border-top:1px solid var(--color-border);color:var(--color-text-faint)">
		© 2026 Portlane
	</footer>
</div>
