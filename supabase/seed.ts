import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SERVICE_KEY) {
	console.error('Missing SUPABASE_SECRET_KEY in environment');
	process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
	auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
	console.log('🌱 Seeding...');

	// 1. Create users via auth admin
	const { data: freelancerAuth } = await admin.auth.admin.createUser({
		email: 'alex@portlane.dev',
		password: 'password123',
		email_confirm: true,
		user_metadata: { full_name: 'Alex Rivera', role: 'freelancer' },
	});

	const { data: client1Auth } = await admin.auth.admin.createUser({
		email: 'sarah@acmecorp.com',
		password: 'password123',
		email_confirm: true,
		user_metadata: { full_name: 'Sarah Chen', role: 'client' },
	});

	const { data: client2Auth } = await admin.auth.admin.createUser({
		email: 'james@startupxyz.com',
		password: 'password123',
		email_confirm: true,
		user_metadata: { full_name: 'James Park', role: 'client' },
	});

	const freelancerId = freelancerAuth!.user.id;
	const client1Id = client1Auth!.user.id;
	const client2Id = client2Auth!.user.id;

	// 2. Update profiles with role (trigger creates them, we just update role)
	await admin.from('profiles').update({ role: 'client' }).in('id', [client1Id, client2Id]);

	// 3. Projects
	const { data: projects } = await admin.from('projects').insert([
		{
			freelancer_id: freelancerId,
			name: 'Brand Redesign',
			description: 'Full visual identity overhaul for Acme Corp.',
			status: 'in_progress',
			due_date: '2026-06-15',
		},
		{
			freelancer_id: freelancerId,
			name: 'Mobile App UI',
			description: 'iOS/Android UI design for Startup XYZ.',
			status: 'review',
			due_date: '2026-06-08',
		},
		{
			freelancer_id: freelancerId,
			name: 'Marketing Site',
			description: 'Landing page and blog for Nova Labs.',
			status: 'planning',
			due_date: '2026-07-01',
		},
	]).select('id, name');

	const [brandProject, mobileProject, marketingProject] = projects!;

	// 4. Link clients to projects
	await admin.from('project_clients').insert([
		{ project_id: brandProject.id, client_id: client1Id },
		{ project_id: mobileProject.id, client_id: client2Id },
	]);

	// 5. Milestones
	await admin.from('milestones').insert([
		{ project_id: brandProject.id, name: 'Discovery & Brief', completed: true,  position: 0 },
		{ project_id: brandProject.id, name: 'Wireframes',         completed: true,  position: 1 },
		{ project_id: brandProject.id, name: 'Visual Design',      completed: false, position: 2 },
		{ project_id: brandProject.id, name: 'Client Review',      completed: false, position: 3 },
		{ project_id: brandProject.id, name: 'Final Delivery',     completed: false, position: 4 },

		{ project_id: mobileProject.id, name: 'UX Research',    completed: true,  position: 0 },
		{ project_id: mobileProject.id, name: 'Wireframes',     completed: true,  position: 1 },
		{ project_id: mobileProject.id, name: 'UI Design',      completed: true,  position: 2 },
		{ project_id: mobileProject.id, name: 'Prototype',      completed: false, position: 3 },

		{ project_id: marketingProject.id, name: 'Kickoff',     completed: false, position: 0 },
		{ project_id: marketingProject.id, name: 'Copywriting', completed: false, position: 1 },
		{ project_id: marketingProject.id, name: 'Design',      completed: false, position: 2 },
	]);

	// 6. Comments
	await admin.from('comments').insert([
		{ project_id: brandProject.id, author_id: freelancerId, body: 'Wireframes are ready for review. Let me know your thoughts!' },
		{ project_id: brandProject.id, author_id: client1Id,    body: 'Looks great! Can we explore a darker color palette?' },
		{ project_id: mobileProject.id, author_id: freelancerId, body: 'Prototype will be ready by end of week.' },
	]);

	// 7. Invoices
	await admin.from('invoices').insert([
		{
			project_id: brandProject.id,
			freelancer_id: freelancerId,
			client_id: client1Id,
			amount_cents: 250000,
			status: 'sent',
			due_date: '2026-06-01',
		},
		{
			project_id: mobileProject.id,
			freelancer_id: freelancerId,
			client_id: client2Id,
			amount_cents: 400000,
			status: 'paid',
			due_date: '2026-05-15',
		},
	]);

	console.log('✅ Done!');
	console.log('   Freelancer: alex@portlane.dev / password123');
	console.log('   Client 1:   sarah@acmecorp.com / password123');
	console.log('   Client 2:   james@startupxyz.com / password123');
	console.log(`   Portal URL: http://localhost:5173/portal?project=${brandProject.id}`);
}

seed().catch((e) => { console.error('❌', e.message); process.exit(1); });
