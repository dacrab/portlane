<script lang="ts">
import IconArrowRightRegular from 'phosphor-icons-svelte/IconArrowRightRegular.svelte'
import IconCheckBold from 'phosphor-icons-svelte/IconCheckBold.svelte'
import Badge from '#lib/ui/Badge.svelte'
import Button from '#lib/ui/Button.svelte'
import Logo from '#lib/ui/Logo.svelte'

const steps = [
	{
		title: 'Invite your client',
		body: 'Add an email and they get a private portal with a secure password link. No new tool for them to learn.',
	},
	{
		title: 'Run the work in the open',
		body: 'Milestones, files, and one comment thread. Everything the project needs, where both of you can see it.',
	},
	{
		title: 'Approve and get paid',
		body: 'Clients approve the work and pay invoices in the same place. Overdue reminders send themselves.',
	},
]

const features = [
	{
		title: 'Milestones',
		body: 'A timeline both sides can read at a glance, with progress that updates as work lands.',
	},
	{
		title: 'Files',
		body: 'Deliverables live on the project, not in an email thread from three weeks ago.',
	},
	{
		title: 'Approvals',
		body: 'One click to approve, or a clear note to request a revision. Both are recorded.',
	},
	{
		title: 'Invoices',
		body: 'Draft, send, and collect payment online. Status follows the money, not your memory.',
	},
	{
		title: 'Time and notes',
		body: 'Log hours for yourself and keep private notes your client never sees.',
	},
	{
		title: 'One portal',
		body: 'A quiet, login-protected space that looks like your studio, not a generic dashboard.',
	},
]

const milestones = [
	{ name: 'Discovery', done: true },
	{ name: 'Design', done: true },
	{ name: 'Development', done: false, current: true },
	{ name: 'Launch', done: false },
]
</script>

<div class="min-h-dvh bg-page">
	<header class="sticky top-0 z-40 border-b border-line bg-page/85 backdrop-blur">
		<div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
			<Logo />

			<nav class="hidden items-center gap-7 text-[13px] text-muted md:flex">
				<a href="#how" class="transition-colors hover:text-ink">How it works</a>
				<a href="#features" class="transition-colors hover:text-ink">Features</a>
			</nav>

			<div class="flex items-center gap-2">
				<a
					href="/login"
					class="px-3 text-[13px] text-muted transition-colors hover:text-ink"
				>
					Log in
				</a>
				<Button href="/signup" size="sm">
					Get started
					<IconArrowRightRegular class="h-3.5 w-3.5" />
				</Button>
			</div>
		</div>
	</header>

	<section class="border-b border-line">
		<div class="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
			<div>
				<p class="flex items-center gap-2.5 text-xs text-muted">
					<span class="lane-mark"></span>
					Client work, one lane
				</p>

				<h1 class="display mt-6 text-[clamp(2.75rem,6vw,4.25rem)] leading-[1.02]">
					Stop chasing.<br />Start shipping.
				</h1>

				<p class="mt-6 max-w-md text-[15px] leading-relaxed text-body">
					Portlane gives every client project a private workspace — milestones,
					files, approvals, and invoices behind one link they will actually use.
				</p>

				<div class="mt-8 flex flex-wrap items-center gap-4">
					<Button href="/signup">
						Start a project
						<IconArrowRightRegular class="h-4 w-4" />
					</Button>
					<span class="text-xs text-muted">Free to use · No card required</span>
				</div>

				<dl class="mt-12 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-5">
					<div>
						<dt class="text-[11px] text-muted">Setup</dt>
						<dd class="mt-1 text-[13px] text-ink">Under 5 minutes</dd>
					</div>
					<div>
						<dt class="text-[11px] text-muted">Client access</dt>
						<dd class="mt-1 text-[13px] text-ink">One private link</dd>
					</div>
					<div>
						<dt class="text-[11px] text-muted">Payments</dt>
						<dd class="mt-1 text-[13px] text-ink">Online, in the portal</dd>
					</div>
				</dl>
			</div>

			<div class="flex justify-center lg:justify-end">
				<div class="w-full max-w-md border border-line bg-surface">
					<div class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
						<div>
							<p class="text-[11px] text-muted">Acme Studio</p>
							<p class="mt-0.5 text-[13px] font-medium text-ink">Website redesign</p>
						</div>
						<Badge tone="accent">In progress</Badge>
					</div>

					<div class="px-5 py-4">
						<div class="flex items-baseline justify-between text-[11px]">
							<span class="text-muted">Milestones</span>
							<span class="tabular text-faint">2 / 4</span>
						</div>
						<div class="mt-2 h-1 overflow-hidden rounded-xs bg-raised">
							<div class="h-full w-1/2 bg-accent"></div>
						</div>

						<ul class="mt-4 space-y-2.5">
							{#each milestones as milestone (milestone.name)}
								<li class="flex items-center gap-2.5">
									<span class="flex h-4 w-4 items-center justify-center rounded-full {milestone.done ? 'bg-accent text-page' : milestone.current ? 'border border-accent text-accent' : 'border border-line-strong text-transparent'}">
										{#if milestone.done}
											<IconCheckBold class="h-2.5 w-2.5" />
										{:else if milestone.current}
											<span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
										{/if}
									</span>
									<span class="text-[13px] {milestone.done ? 'text-faint line-through' : 'text-body'}">
										{milestone.name}
									</span>
									{#if milestone.current}
										<span class="ml-auto text-[10px] text-accent">Now</span>
									{/if}
								</li>
							{/each}
						</ul>
					</div>

					<div class="border-t border-line px-5 py-4">
						<div class="flex items-baseline justify-between">
							<span class="text-[11px] text-muted">Invoice 003</span>
							<span class="tabular text-[13px] font-medium text-ink">$3,200</span>
						</div>
						<div class="mt-2 flex items-center justify-between">
							<span class="text-[11px] text-muted">Due Jun 30</span>
							<Badge tone="warning">Sent</Badge>
						</div>
					</div>

					<div class="flex items-center justify-between border-t border-line bg-raised px-5 py-2.5">
						<span class="text-[10px] text-muted">Client portal</span>
						<span class="text-[10px] text-faint">acme.portlane.app</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section id="how" class="border-b border-line bg-surface">
		<div class="mx-auto max-w-6xl px-6 py-20">
			<p class="flex items-center gap-2.5 text-xs text-muted">
				<span class="lane-mark"></span>
				How it works
			</p>
			<h2 class="display mt-4 max-w-xl text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08]">
				Less back-and-forth.<br />More finished work.
			</h2>

			<div class="mt-12 grid gap-10 md:grid-cols-3">
				{#each steps as step, index (step.title)}
					<div class="border-t border-line pt-5">
						<span class="tabular text-[11px] text-faint">0{index + 1}</span>
						<h3 class="mt-3 text-[15px] font-medium text-ink">{step.title}</h3>
						<p class="mt-2 text-[13px] leading-relaxed text-muted">{step.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="border-b border-line">
		<div class="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 lg:grid-cols-2">
			<div>
				<p class="flex items-center gap-2.5 text-xs text-muted">
					<span class="lane-mark"></span>
					Invoicing
				</p>
				<h2 class="display mt-4 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08]">
					Get paid without the follow-up.
				</h2>
				<p class="mt-4 max-w-md text-[14px] leading-relaxed text-body">
					Create an invoice in seconds, send it inside the portal, and let the
					client pay in one click. Reminders go out on their own.
				</p>
				<ul class="mt-6 space-y-2.5">
					{#each ['Draft, sent, paid — status follows the money', 'Clients pay from the same portal', 'Overdue reminders every seven days'] as item (item)}
						<li class="flex items-center gap-2.5 text-[13px] text-body">
							<span class="text-accent"><IconCheckBold class="h-3.5 w-3.5" /></span>
							{item}
						</li>
					{/each}
				</ul>
			</div>

			<div class="border border-line bg-surface">
				<div class="border-b border-line px-5 py-3 text-[11px] font-medium text-muted">
					Invoices
				</div>
				{#each [{ name: 'Website redesign', amount: '$3,200', status: 'Paid', tone: 'success' }, { name: 'Brand identity', amount: '$1,800', status: 'Sent', tone: 'warning' }, { name: 'Monthly retainer', amount: '$900', status: 'Draft', tone: 'neutral' }] as row (row.name)}
					<div class="flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0">
						<div>
							<p class="text-[13px] font-medium text-ink">{row.name}</p>
							<p class="mt-0.5 tabular text-[11px] text-muted">{row.amount}</p>
						</div>
						<Badge tone={row.tone as 'success' | 'warning' | 'neutral'}>{row.status}</Badge>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section id="features" class="border-b border-line bg-surface">
		<div class="mx-auto max-w-6xl px-6 py-20">
			<p class="flex items-center gap-2.5 text-xs text-muted">
				<span class="lane-mark"></span>
				Everything in the workspace
			</p>
			<h2 class="display mt-4 max-w-xl text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08]">
				One place. Both sides.
			</h2>

			<div class="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each features as feature (feature.title)}
					<div class="border-t border-line pt-5">
						<h3 class="text-[14px] font-medium text-ink">{feature.title}</h3>
						<p class="mt-2 text-[13px] leading-relaxed text-muted">{feature.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="bg-ink">
		<div class="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-20 sm:flex-row sm:items-end">
			<div>
				<p class="text-xs text-page/50">Ready when you are</p>
				<h2 class="display mt-3 max-w-lg text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.08] text-page">
					Give your next project a proper home.
				</h2>
			</div>
			<Button href="/signup" size="md" class="shrink-0">
				Get started
				<IconArrowRightRegular class="h-4 w-4" />
			</Button>
		</div>
	</section>

	<footer class="bg-surface">
		<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
			<Logo size="sm" />
			<p class="text-[11px] text-muted">© {new Date().getFullYear()} Portlane</p>
			<div class="flex gap-5 text-[11px] text-muted">
				<a href="/login" class="transition-colors hover:text-ink">Log in</a>
				<a href="/signup" class="transition-colors hover:text-ink">Sign up</a>
			</div>
		</div>
	</footer>
</div>
