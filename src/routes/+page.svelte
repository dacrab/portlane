<script lang="ts">
	import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte';
	import IconStarFill from 'phosphor-icons-svelte/IconStarFill.svelte';
	import IconCheckRegular from 'phosphor-icons-svelte/IconCheckRegular.svelte';

	const reviews = [
		{ quote: "My clients stopped asking 'where's the file?' within the first week.", name: 'Maya R.', role: 'Brand Designer' },
		{ quote: "Invoicing used to take me an afternoon. Now it's five minutes and it looks great.", name: 'Tom H.', role: 'Freelance Developer' },
		{ quote: "The portal makes us look like a much bigger studio. Clients notice.", name: 'Sara K.', role: 'Creative Director' },
	];
</script>

<div class="min-h-screen" style="background:var(--color-bg);color:var(--color-text)">

	<!-- Nav -->
	<header class="sticky top-0 z-40" style="background:color-mix(in srgb, var(--color-bg-elevated) 85%, transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--color-border)">
		<div class="mx-auto flex h-14 max-w-[68rem] items-center gap-8 px-8">
			<a href="/" class="mr-auto flex items-center gap-2 text-[0.9375rem] font-bold -tracking-[0.02em] no-underline" style="color:var(--color-text-heading)">
				<img src="/favicon.svg" alt="" class="h-[1.375rem] w-[1.375rem]" />
				Portlane
			</a>
			<nav class="flex items-center gap-7 max-md:hidden">
				<a href="#how" class="text-sm no-underline" style="color:var(--color-text-muted)">How it works</a>
				<a href="#reviews" class="text-sm no-underline" style="color:var(--color-text-muted)">Reviews</a>
				<a href="/login" class="text-sm no-underline" style="color:var(--color-text-muted)">Log in</a>
			</nav>
			<a href="/signup" class="btn btn-primary">Start free trial</a>
		</div>
	</header>

	<!-- Hero -->
	<section class="border-b px-8 py-20 md:py-24" style="border-color:var(--color-border)">
		<div class="mx-auto grid max-w-[68rem] items-center gap-16 md:grid-cols-2">
			<div>
				<h1 class="m-0 mb-5 text-[clamp(2.25rem,4.5vw,3.25rem)] font-extrabold leading-[1.08] -tracking-[0.04em]" style="color:var(--color-text-heading)">Client work,<br>finally organized.</h1>
				<p class="m-0 mb-8 max-w-[38ch] leading-[1.7]" style="font-size:1.0625rem;color:var(--color-text-muted)">Portlane gives every project a private workspace — timeline, files, invoices, and approvals in one place. Your clients will actually use it.</p>
				<div class="mb-6 flex flex-wrap items-center gap-5">
				<a href="/signup" class="btn btn-primary btn-lg">
					Start free trial <IconArrowRightRegular class="h-[0.875rem] w-[0.875rem] shrink-0" />
				</a>
					<span class="text-xs" style="color:var(--color-text-faint)">Free forever for 1 project · No credit card</span>
				</div>
				<div class="flex items-center gap-1" style="color:#f59e0b">
					{#each Array(5) as _}
						<IconStarFill class="h-[0.875rem] w-[0.875rem]" />
					{/each}
					<span class="ml-1 text-xs" style="color:var(--color-text-muted)">Loved by 800+ freelancers</span>
				</div>
			</div>

			<!-- UI preview -->
			<div class="flex justify-end max-md:justify-start">
				<div class="w-full max-w-[22rem] overflow-hidden rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)]" style="background:var(--color-bg-elevated);border:1px solid var(--color-border)">
					<div class="flex items-center gap-3 border-b px-4 py-3" style="background:var(--color-bg-subtle);border-color:var(--color-border)">
						<div class="flex gap-[0.3rem]">
							<span class="block h-2 w-2 rounded-full" style="background:#ef4444"></span>
							<span class="block h-2 w-2 rounded-full" style="background:#f59e0b"></span>
							<span class="block h-2 w-2 rounded-full" style="background:#22c55e"></span>
						</div>
						<span class="text-xs font-medium" style="color:var(--color-text-muted)">Acme Corp · Website Redesign</span>
					</div>
					<div class="p-5">
						<div class="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.05em]" style="color:var(--color-text-faint)">Milestones</div>
						{#each [['Discovery', true],['Design', true],['Development', false],['Launch', false]] as [m, done]}
							<div class="flex items-center gap-[0.625rem] py-[0.3rem]">
								<span class="flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-full border" class:done style="border:1.5px solid var(--color-border);color:var(--color-bg-elevated);background:{done ? 'var(--color-ink)' : 'transparent'};border-color:{done ? 'var(--color-ink)' : 'var(--color-border)'}">
									{#if done}<IconCheckRegular class="h-[0.625rem] w-[0.625rem]" />{/if}
								</span>
								<span class="text-sm" class:done style="color:{(done ? 'var(--color-text-faint)' : 'var(--color-text)')};text-decoration:{done ? 'line-through' : 'none'}">{m}</span>
							</div>
						{/each}
						<div class="my-4 h-px" style="background:var(--color-border-subtle)"></div>
						<div class="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.05em]" style="color:var(--color-text-faint)">Invoice #003</div>
						<div class="flex items-center justify-between py-1 text-sm" style="color:var(--color-text)"><span style="color:var(--color-text-muted)">Design phase — 20h</span><span>$3,200</span></div>
						<div class="mt-1 flex items-center justify-between border-t pt-2 text-sm font-semibold" style="border-color:var(--color-border-subtle)"><span>Total due</span><span class="text-base" style="color:var(--color-text-heading)">$3,200</span></div>
						<button class="mt-[0.875rem] w-full cursor-pointer rounded-[0.375rem] border-none px-2 py-2 text-sm font-medium transition-colors duration-150" style="background:var(--color-ink);color:var(--color-bg-elevated)">Pay now</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Logos / trust strip -->
	<div class="mx-auto flex max-w-[68rem] flex-wrap items-center gap-6 border-b px-8 py-6 text-xs" style="color:var(--color-text-faint);border-color:var(--color-border)">
		<span>Used by freelancers at</span>
		{#each ['Figma', 'Shopify', 'Stripe', 'Webflow', 'Vercel'] as co}
			<span class="font-semibold -tracking-[0.01em]" style="color:var(--color-border)">{co}</span>
		{/each}
	</div>

	<!-- How it works -->
	<section id="how" class="px-8 py-20" style="background:var(--color-bg-elevated)">
		<div class="mx-auto max-w-[68rem]">
			<p class="m-0 mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.07em]" style="color:var(--color-text-heading)">How it works</p>
			<h2 class="m-0 mb-12 text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-[1.1] -tracking-[0.035em]" style="color:var(--color-text-heading)">Less back-and-forth.<br>More done.</h2>
			<div class="grid gap-12 md:grid-cols-3">
				<div class="flex flex-col gap-[0.875rem]">
					<span class="text-[0.6875rem] font-bold tracking-[0.06em]" style="color:var(--color-border)">01</span>
					<h3 class="m-0 mb-2 text-[1.0625rem] font-semibold -tracking-[0.02em]" style="color:var(--color-text-heading)">Invite your client with one link</h3>
					<p class="m-0 text-[0.9375rem] leading-[1.65]" style="color:var(--color-text-muted)">No account needed on their end. A magic link lands in their inbox and they're in — straight to their project.</p>
				</div>
				<div class="flex flex-col gap-[0.875rem]">
					<span class="text-[0.6875rem] font-bold tracking-[0.06em]" style="color:var(--color-border)">02</span>
					<h3 class="m-0 mb-2 text-[1.0625rem] font-semibold -tracking-[0.02em]" style="color:var(--color-text-heading)">Everything in one place</h3>
					<p class="m-0 text-[0.9375rem] leading-[1.65]" style="color:var(--color-text-muted)">Files, milestones, comments, and invoices — all in a clean timeline. Clients stop asking, you stop repeating yourself.</p>
				</div>
				<div class="flex flex-col gap-[0.875rem]">
					<span class="text-[0.6875rem] font-bold tracking-[0.06em]" style="color:var(--color-border)">03</span>
					<h3 class="m-0 mb-2 text-[1.0625rem] font-semibold -tracking-[0.02em]" style="color:var(--color-text-heading)">Approve, pay, move on</h3>
					<p class="m-0 text-[0.9375rem] leading-[1.65]" style="color:var(--color-text-muted)">Clients approve work and pay invoices in the same portal. No email chains. No "did you get my payment?" messages.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Feature highlight -->
	<section class="px-8 py-20">
		<div class="mx-auto grid max-w-[68rem] items-center gap-20 md:grid-cols-2">
			<div>
				<p class="m-0 mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.07em]" style="color:var(--color-text-heading)">Invoicing</p>
				<h2 class="mb-4 text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-[1.1] -tracking-[0.035em]" style="color:var(--color-text-heading)">Get paid faster.</h2>
				<p class="m-0 mb-6 text-base leading-[1.7]" style="color:var(--color-text-muted)">Create an invoice in seconds, send it inside the portal, and let clients pay in one click. No PDFs flying around in email.</p>
				<ul class="m-0 flex list-none flex-col gap-[0.625rem] p-0">
					{#each ['Draft → sent → paid tracking','Clients pay without an account','Attach invoices to milestones'] as item}
						<li class="flex items-center gap-2 text-[0.9375rem]" style="color:var(--color-text)"><span style="color:var(--color-text-heading)"><IconCheckRegular class="h-4 w-4 shrink-0" /></span>{item}</li>
					{/each}
				</ul>
			</div>
			<div class="flex justify-center">
				<div class="w-full max-w-[22rem] overflow-hidden rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)]" style="background:var(--color-bg-elevated);border:1px solid var(--color-border)">
					<div class="border-b px-5 py-[0.875rem] text-[0.8125rem] font-semibold" style="color:var(--color-text-heading);border-color:var(--color-border);background:var(--color-bg-subtle)">Invoices</div>
					{#each [['Website Redesign','$3,200','Paid'],['Brand Identity','$1,800','Sent'],['Monthly Retainer','$900','Draft']] as row}
						<div class="flex items-center justify-between border-b px-5 py-[0.875rem]" style="border-color:var(--color-border-subtle)">
							<div>
								<div class="mb-[0.125rem] text-sm font-medium" style="color:var(--color-text-heading)">{row[0]}</div>
								<div class="text-xs" style="color:var(--color-text-faint)">{row[1]}</div>
							</div>
							<span class="rounded-full px-2 py-[0.2rem] text-[0.6875rem] font-semibold" style="background:{(row[2] === 'Paid' ? 'rgba(21,128,61,0.10)' : row[2] === 'Sent' ? 'rgba(180,83,9,0.10)' : 'var(--color-bg-subtle)')};color:{(row[2] === 'Paid' ? '#15803d' : row[2] === 'Sent' ? '#b45309' : 'var(--color-text-muted)')}">{row[2]}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Reviews -->
	<section id="reviews" class="px-8 py-20" style="background:var(--color-bg-elevated)">
		<div class="mx-auto max-w-[68rem]">
			<p class="m-0 mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.07em]" style="color:var(--color-text-heading)">Reviews</p>
			<h2 class="m-0 mb-12 text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold leading-[1.1] -tracking-[0.035em]" style="color:var(--color-text-heading)">Built for the work you do.</h2>
			<div class="grid gap-6 md:grid-cols-3">
				{#each reviews as { quote, name, role }}
					<div class="flex flex-col gap-4 rounded-xl border p-6" style="background:var(--color-bg-elevated);border-color:var(--color-border)">
						<div class="flex gap-[0.2rem]" style="color:#f59e0b">
							{#each Array(5) as _}<IconStarFill class="h-[0.8125rem] w-[0.8125rem]" />{/each}
						</div>
						<p class="m-0 flex-1 text-[0.9375rem] leading-[1.6]" style="color:var(--color-text)">{quote}</p>
						<div class="flex flex-col gap-[0.125rem]">
							<span class="text-sm font-semibold" style="color:var(--color-text-heading)">{name}</span>
							<span class="text-xs" style="color:var(--color-text-faint)">{role}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="border-t px-8 py-24" style="border-color:var(--color-border)">
		<div class="mx-auto flex max-w-[68rem] flex-col items-center gap-4 text-center">
			<h2 class="m-0 text-[clamp(1.75rem,3.5vw,2.5rem)] font-extrabold -tracking-[0.035em]" style="color:var(--color-text-heading)">Ready to impress your clients?</h2>
			<p class="m-0 mb-2 text-base" style="color:var(--color-text-muted)">Set up your first project in under 5 minutes.</p>
			<a href="/signup" class="btn btn-primary btn-lg">
				Start free trial <IconArrowRightRegular class="h-[0.875rem] w-[0.875rem] shrink-0" />
			</a>
		</div>
	</section>

	<footer style="background:var(--color-bg-elevated);border-top:1px solid var(--color-border)">
		<div class="mx-auto flex max-w-[68rem] flex-wrap items-center justify-between gap-4 px-8 py-6">
			<a href="/" class="flex items-center gap-2 text-[0.9375rem] font-bold -tracking-[0.02em] no-underline" style="color:var(--color-text-heading);opacity:0.5">
				<img src="/favicon.svg" alt="" class="h-[1.375rem] w-[1.375rem]" />
				Portlane
			</a>
			<p class="m-0 text-xs" style="color:var(--color-text-faint)">© 2026 Portlane</p>
			<div class="flex gap-5">
				<a href="/login" class="text-xs no-underline" style="color:var(--color-text-faint)">Log in</a>
				<a href="/signup" class="text-xs no-underline" style="color:var(--color-text-faint)">Sign up</a>
			</div>
		</div>
	</footer>

</div>
