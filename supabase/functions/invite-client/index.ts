import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1?target=deno'
import {
	SUPABASE_ANON_KEY,
	SUPABASE_SERVICE_ROLE_KEY,
	SUPABASE_URL,
} from '../_shared/env.ts'

serve(async (req) => {
	if (req.method !== 'POST') {
		return new Response('Method not allowed', { status: 405 })
	}

	const authHeader = req.headers.get('Authorization')
	if (!authHeader) {
		return new Response('Unauthorized', { status: 401 })
	}

	const supabaseUrl = SUPABASE_URL
	const supabaseServiceKey = SUPABASE_SERVICE_ROLE_KEY
	const supabaseAnonKey = SUPABASE_ANON_KEY
	const appUrl = Deno.env.get('PUBLIC_APP_URL')

	if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !appUrl) {
		return new Response('Server configuration error', { status: 500 })
	}

	// Authenticate user with anon key
	const userClient = createClient(supabaseUrl, supabaseAnonKey, {
		global: { headers: { Authorization: authHeader } },
	})

	const {
		data: { user },
		error: userError,
	} = await userClient.auth.getUser()
	if (userError || !user) {
		return new Response('Unauthorized', { status: 401 })
	}

	let body: { email: string; projectId: string }
	try {
		body = await req.json()
	} catch {
		return new Response('Invalid JSON', { status: 400 })
	}

	if (!body.email || !body.projectId) {
		return new Response('Missing email or projectId', { status: 400 })
	}

	// Verify caller owns the project
	const { data: project, error: projectError } = await userClient
		.from('projects')
		.select('id')
		.eq('id', body.projectId)
		.eq('freelancer_id', user.id)
		.single()

	if (projectError || !project) {
		return new Response('Project not found', { status: 404 })
	}

	const email = body.email.trim().toLowerCase()

	// Use admin client for the invite
	const admin = createClient(supabaseUrl, supabaseServiceKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	})

	const redirectTo = `${appUrl}/auth/callback?next=/portal?project=${body.projectId}`

	const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
		email,
		{
			data: { role: 'client' },
			redirectTo,
		},
	)

	if (inviteError) {
		return new Response(JSON.stringify({ error: inviteError.message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		})
	}

	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
	})
})
