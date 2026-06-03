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

<div class="page">

	<!-- Nav -->
	<header class="nav">
		<div class="nav-inner">
			<a href="/" class="logo">
				<img src="/favicon.svg" alt="" class="logo-img" />
				Portlane
			</a>
			<nav class="nav-links">
				<a href="#how">How it works</a>
				<a href="#reviews">Reviews</a>
				<a href="/login">Log in</a>
			</nav>
			<a href="/dashboard" class="btn-primary">Start free trial</a>
		</div>
	</header>

	<!-- Hero -->
	<section class="hero">
		<div class="hero-inner">
			<div class="hero-text">
				<h1>Client work,<br>finally organized.</h1>
				<p class="hero-sub">Portlane gives every project a private workspace — timeline, files, invoices, and approvals in one place. Your clients will actually use it.</p>
				<div class="hero-actions">
					<a href="/dashboard" class="btn-primary btn-lg">
						Start free trial <IconArrowRightRegular class="btn-icon" />
					</a>
					<span class="hero-note">Free forever for 1 project · No credit card</span>
				</div>
				<!-- Social proof -->
				<div class="stars-row">
					{#each Array(5) as _}
						<IconStarFill class="star" />
					{/each}
					<span class="stars-label">Loved by 800+ freelancers</span>
				</div>
			</div>

			<!-- UI preview -->
			<div class="hero-preview">
				<div class="preview-card">
					<div class="preview-topbar">
						<div class="preview-circles">
							<span style="background:#ef4444"></span>
							<span style="background:#f59e0b"></span>
							<span style="background:#22c55e"></span>
						</div>
						<span class="preview-title">Acme Corp · Website Redesign</span>
					</div>
					<div class="preview-body">
						<!-- Milestone timeline -->
						<div class="preview-section-label">Milestones</div>
						{#each [['Discovery', true],['Design', true],['Development', false],['Launch', false]] as [m, done]}
							<div class="milestone-row">
								<span class="m-check" class:done>{#if done}<IconCheckRegular class="check-icon" />{/if}</span>
								<span class="m-label" class:done>{m}</span>
							</div>
						{/each}
						<div class="preview-divider"></div>
						<!-- Invoice -->
						<div class="preview-section-label">Invoice #003</div>
						<div class="invoice-row">
							<span class="inv-desc">Design phase — 20h</span>
							<span class="inv-amount">$3,200</span>
						</div>
						<div class="invoice-row inv-total-row">
							<span>Total due</span>
							<span class="inv-total">$3,200</span>
						</div>
						<button class="pay-btn">Pay now</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Logos / trust strip -->
	<div class="trust-strip">
		<span>Used by freelancers at</span>
		{#each ['Figma', 'Shopify', 'Stripe', 'Webflow', 'Vercel'] as co}
			<span class="trust-co">{co}</span>
		{/each}
	</div>

	<!-- How it works -->
	<section id="how" class="section section-alt">
		<div class="section-inner">
			<p class="section-eyebrow">How it works</p>
			<h2>Less back-and-forth.<br>More done.</h2>

			<div class="steps">
				<div class="step">
					<span class="step-n">01</span>
					<div>
						<h3>Invite your client with one link</h3>
						<p>No account needed on their end. A magic link lands in their inbox and they're in — straight to their project.</p>
					</div>
				</div>
				<div class="step">
					<span class="step-n">02</span>
					<div>
						<h3>Everything in one place</h3>
						<p>Files, milestones, comments, and invoices — all in a clean timeline. Clients stop asking, you stop repeating yourself.</p>
					</div>
				</div>
				<div class="step">
					<span class="step-n">03</span>
					<div>
						<h3>Approve, pay, move on</h3>
						<p>Clients approve work and pay invoices in the same portal. No email chains. No "did you get my payment?" messages.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Feature highlight -->
	<section class="section">
		<div class="section-inner split">
			<div class="split-text">
				<p class="section-eyebrow">Invoicing</p>
				<h2>Get paid faster.</h2>
				<p class="split-body">Create an invoice in seconds, send it inside the portal, and let clients pay in one click. No PDFs flying around in email.</p>
				<ul class="check-list">
					{#each ['Draft → sent → paid tracking','Clients pay without an account','Attach invoices to milestones'] as item}
						<li><IconCheckRegular class="li-check" />{item}</li>
					{/each}
				</ul>
			</div>
			<!-- Invoice preview widget -->
			<div class="split-visual">
				<div class="widget">
					<div class="widget-head">Invoices</div>
					{#each [['Website Redesign','$3,200','Paid'],['Brand Identity','$1,800','Sent'],['Monthly Retainer','$900','Draft']] as row}
						<div class="widget-row">
							<div>
								<div class="wr-title">{row[0]}</div>
								<div class="wr-amt">{row[1]}</div>
							</div>
							<span class="wr-badge {(row[2] ?? '').toLowerCase()}">{row[2]}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Reviews -->
	<section id="reviews" class="section section-alt">
		<div class="section-inner">
			<p class="section-eyebrow">Reviews</p>
			<h2>Built for the work you do.</h2>
			<div class="reviews-grid">
				{#each reviews as { quote, name, role }}
					<div class="review-card">
						<div class="review-stars">
							{#each Array(5) as _}<IconStarFill class="star-sm" />{/each}
						</div>
						<p class="review-quote">{quote}</p>
						<div class="review-author">
							<span class="review-name">{name}</span>
							<span class="review-role">{role}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="cta-section">
		<div class="cta-inner">
			<h2>Ready to impress your clients?</h2>
			<p>Set up your first project in under 5 minutes.</p>
			<a href="/dashboard" class="btn-primary btn-lg">
				Start free trial <IconArrowRightRegular class="btn-icon" />
			</a>
		</div>
	</section>

	<footer class="footer">
		<div class="footer-inner">
			<a href="/" class="logo" style="opacity:0.5">
				<img src="/favicon.svg" alt="" class="logo-img" />
				Portlane
			</a>
			<p class="footer-copy">© 2026 Portlane</p>
			<div class="footer-links">
				<a href="/login">Log in</a>
				<a href="/dashboard">Sign up</a>
			</div>
		</div>
	</footer>

</div>

<style>
.page {
	background: var(--color-bg);
	color: var(--color-text);
	font-family: var(--font-sans);
	min-height: 100vh;
}

.nav {
	position: sticky;
	top: 0;
	z-index: 40;
	background: color-mix(in srgb, var(--color-bg-elevated) 85%, transparent);
	backdrop-filter: blur(12px);
	border-bottom: 1px solid var(--color-border);
}
.nav-inner {
	max-width: 68rem;
	margin: 0 auto;
	padding: 0 2rem;
	height: 3.5rem;
	display: flex;
	align-items: center;
	gap: 2rem;
}
.logo {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.9375rem;
	font-weight: 700;
	letter-spacing: -0.02em;
	color: var(--color-text-heading);
	text-decoration: none;
	margin-right: auto;
}
.logo-img { width: 1.375rem; height: 1.375rem; }
.nav-links { display: flex; align-items: center; gap: 1.75rem; }
.nav-links a { font-size: 0.875rem; color: var(--color-text-muted); text-decoration: none; transition: color 0.15s; }
.nav-links a:hover { color: var(--color-text-heading); }

.btn-primary {
	display: inline-flex;
	align-items: center;
	gap: 0.375rem;
	background: var(--color-ink);
	color: var(--color-bg-elevated);
	font-size: 0.875rem;
	font-weight: 500;
	padding: 0.5rem 1rem;
	border-radius: var(--radius-sm);
	text-decoration: none;
	white-space: nowrap;
	transition: background 0.15s;
}
.btn-primary:hover { background: var(--color-ink-hover); }
.btn-lg { font-size: 0.9375rem; padding: 0.6875rem 1.375rem; }
.btn-icon { width: 0.875rem; height: 0.875rem; flex-shrink: 0; }

.hero { border-bottom: 1px solid var(--color-border); padding: 5rem 2rem 4rem; }
.hero-inner {
	max-width: 68rem;
	margin: 0 auto;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 4rem;
	align-items: center;
}
.hero-text h1 {
	font-size: clamp(2.25rem, 4.5vw, 3.25rem);
	font-weight: 800;
	letter-spacing: -0.04em;
	line-height: 1.08;
	color: var(--color-text-heading);
	margin: 0 0 1.25rem;
}
.hero-sub { font-size: 1.0625rem; line-height: 1.7; color: var(--color-text-muted); margin: 0 0 2rem; max-width: 38ch; }
.hero-actions { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.hero-note { font-size: 0.8125rem; color: var(--color-text-faint); }
.stars-row { display: flex; align-items: center; gap: 0.25rem; }
.stars-row :global(.star) { width: 0.875rem; height: 0.875rem; color: #f59e0b; }
.stars-label { margin-left: 0.375rem; font-size: 0.8125rem; color: var(--color-text-muted); }

.hero-preview { display: flex; justify-content: flex-end; }
.preview-card {
	width: 100%;
	max-width: 22rem;
	background: var(--color-bg-elevated);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-pop);
	overflow: hidden;
}
.preview-topbar {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	background: var(--color-bg-subtle);
	border-bottom: 1px solid var(--color-border);
}
.preview-circles { display: flex; gap: 0.3rem; }
.preview-circles span { width: 0.5rem; height: 0.5rem; border-radius: 50%; display: block; }
.preview-title { font-size: 0.75rem; font-weight: 500; color: var(--color-text-muted); }
.preview-body { padding: 1.25rem; }
.preview-section-label {
	font-size: 0.6875rem;
	font-weight: 600;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--color-text-faint);
	margin-bottom: 0.75rem;
}
.milestone-row { display: flex; align-items: center; gap: 0.625rem; padding: 0.3rem 0; }
.m-check {
	width: 1.125rem;
	height: 1.125rem;
	border-radius: 50%;
	border: 1.5px solid var(--color-border);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: var(--color-bg-elevated);
}
.m-check.done { background: var(--color-ink); border-color: var(--color-ink); }
.m-check :global(.check-icon) { width: 0.625rem; height: 0.625rem; }
.m-label { font-size: 0.875rem; color: var(--color-text); }
.m-label.done { color: var(--color-text-faint); text-decoration: line-through; }
.preview-divider { height: 1px; background: var(--color-border-subtle); margin: 1rem 0; }
.invoice-row { display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0; font-size: 0.875rem; color: var(--color-text); }
.inv-desc { color: var(--color-text-muted); }
.inv-total-row { border-top: 1px solid var(--color-border-subtle); padding-top: 0.5rem; margin-top: 0.25rem; font-weight: 600; }
.inv-total { font-size: 1rem; color: var(--color-text-heading); }
.pay-btn {
	margin-top: 0.875rem;
	width: 100%;
	background: var(--color-ink);
	color: var(--color-bg-elevated);
	border: none;
	border-radius: var(--radius-sm);
	padding: 0.5rem;
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;
}
.pay-btn:hover { background: var(--color-ink-hover); }

.trust-strip {
	max-width: 68rem;
	margin: 0 auto;
	padding: 1.5rem 2rem;
	display: flex;
	align-items: center;
	gap: 1.5rem;
	flex-wrap: wrap;
	font-size: 0.8125rem;
	color: var(--color-text-faint);
	border-bottom: 1px solid var(--color-border);
}
.trust-co { font-weight: 600; color: var(--color-border); letter-spacing: -0.01em; }

.section { padding: 5rem 2rem; }
.section-alt { background: var(--color-bg-elevated); }
.section-inner { max-width: 68rem; margin: 0 auto; }
.section-eyebrow {
	font-size: 0.75rem;
	font-weight: 600;
	letter-spacing: 0.07em;
	text-transform: uppercase;
	color: var(--color-text-heading);
	margin: 0 0 0.75rem;
}
.section-inner > h2 {
	font-size: clamp(1.75rem, 3.5vw, 2.5rem);
	font-weight: 800;
	letter-spacing: -0.035em;
	line-height: 1.1;
	color: var(--color-text-heading);
	margin: 0 0 3rem;
}

.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3rem; }
.step { display: flex; flex-direction: column; gap: 0.875rem; }
.step-n { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; color: var(--color-border); }
.step h3 { font-size: 1.0625rem; font-weight: 600; letter-spacing: -0.02em; color: var(--color-text-heading); margin: 0 0 0.5rem; }
.step p { font-size: 0.9375rem; line-height: 1.65; color: var(--color-text-muted); margin: 0; }

.split { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
.split-text h2 { margin-bottom: 1rem; }
.split-body { font-size: 1rem; line-height: 1.7; color: var(--color-text-muted); margin: 0 0 1.5rem; }
.check-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.625rem; }
.check-list li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; color: var(--color-text); }
.check-list :global(.li-check) { width: 1rem; height: 1rem; color: var(--color-text-heading); flex-shrink: 0; }

.split-visual { display: flex; justify-content: center; }
.widget {
	width: 100%;
	max-width: 22rem;
	background: var(--color-bg-elevated);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-pop);
	overflow: hidden;
}
.widget-head { padding: 0.875rem 1.25rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-text-heading); border-bottom: 1px solid var(--color-border); background: var(--color-bg-subtle); }
.widget-row { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1.25rem; border-bottom: 1px solid var(--color-border-subtle); }
.wr-title { font-size: 0.875rem; font-weight: 500; color: var(--color-text-heading); margin-bottom: 0.125rem; }
.wr-amt { font-size: 0.8125rem; color: var(--color-text-faint); }
.wr-badge { font-size: 0.6875rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 9999px; }
.wr-badge.paid  { background: rgba(21,128,61,0.10);  color: #15803d; }
.wr-badge.sent  { background: rgba(180,83,9,0.10);   color: #b45309; }
.wr-badge.draft { background: var(--color-bg-subtle); color: var(--color-text-muted); }

.reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.review-card {
	background: var(--color-bg-elevated);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.review-stars { display: flex; gap: 0.2rem; }
.review-stars :global(.star-sm) { width: 0.8125rem; height: 0.8125rem; color: #f59e0b; }
.review-quote { font-size: 0.9375rem; line-height: 1.6; color: var(--color-text); flex: 1; margin: 0; }
.review-author { display: flex; flex-direction: column; gap: 0.125rem; }
.review-name { font-size: 0.875rem; font-weight: 600; color: var(--color-text-heading); }
.review-role { font-size: 0.8125rem; color: var(--color-text-faint); }

.cta-section { padding: 6rem 2rem; border-top: 1px solid var(--color-border); }
.cta-inner { max-width: 68rem; margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1rem; }
.cta-inner h2 { font-size: clamp(1.75rem, 3.5vw, 2.5rem); font-weight: 800; letter-spacing: -0.035em; color: var(--color-text-heading); margin: 0; }
.cta-inner p { font-size: 1rem; color: var(--color-text-muted); margin: 0 0 0.5rem; }

.footer { background: var(--color-bg-elevated); border-top: 1px solid var(--color-border); }
.footer-inner { max-width: 68rem; margin: 0 auto; padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.footer-copy { font-size: 0.8125rem; color: var(--color-text-faint); margin: 0; }
.footer-links { display: flex; gap: 1.25rem; }
.footer-links a { font-size: 0.8125rem; color: var(--color-text-faint); text-decoration: none; }
.footer-links a:hover { color: var(--color-text-heading); }

@media (max-width: 768px) {
	.hero-inner, .split { grid-template-columns: 1fr; gap: 2.5rem; }
	.hero-preview { justify-content: flex-start; }
	.steps, .reviews-grid { grid-template-columns: 1fr; gap: 2rem; }
	.nav-links { display: none; }
	.trust-strip { gap: 1rem; }
}
</style>
