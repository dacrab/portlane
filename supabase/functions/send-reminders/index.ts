import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1?target=deno'

const RESEND_API = 'https://api.resend.com/emails'

serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('REMINDER_FROM_EMAIL') ?? 'noreply@portlane.app'
  const fromName = Deno.env.get('REMINDER_FROM_NAME') ?? 'Portlane'
  const appUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'https://portlane.vercel.app'

  if (!supabaseUrl || !serviceKey) {
    return new Response('Server config error', { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  await supabase.from('invoices').update({ status: 'overdue' }).eq('status', 'sent').lt('due_date', new Date().toISOString().split('T')[0])

  const in3Days = new Date()
  in3Days.setDate(in3Days.getDate() + 3)
  const in3DaysStr = in3Days.toISOString().split('T')[0]

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, amount_cents, due_date, status, client_id, project_id, last_reminder_sent_at')
    .in('status', ['sent', 'overdue'])

  if (invoices && resendKey) {
    for (const inv of invoices) {
      const { data: project } = await supabase.from('projects').select('name').eq('id', inv.project_id).single()
      const { data: client } = await supabase.from('profiles').select('email').eq('id', inv.client_id).single()

      if (!client?.email) continue

      const projectName = project?.name ?? 'Project'
      const lastSent = inv.last_reminder_sent_at ? new Date(inv.last_reminder_sent_at) : null
      const dayAgo = new Date(Date.now() - 86400000)
      const weekAgo = new Date(Date.now() - 604800000)

      if (inv.status === 'overdue' && (!lastSent || lastSent < weekAgo)) {
        await send(resendKey, fromEmail, fromName, client.email,
          'Overdue invoice - ' + projectName,
          'Invoice for ' + projectName + ' ($' + (inv.amount_cents / 100).toFixed(2) + ') is overdue since ' + inv.due_date + '. Pay: ' + appUrl + '/portal?project=' + inv.project_id)
        await supabase.from('invoices').update({ last_reminder_sent_at: new Date().toISOString() }).eq('id', inv.id)
      } else if (inv.due_date === in3DaysStr && inv.status === 'sent' && (!lastSent || lastSent < dayAgo)) {
        await send(resendKey, fromEmail, fromName, client.email,
          'Invoice due in 3 days - ' + projectName,
          'Invoice for ' + projectName + ' ($' + (inv.amount_cents / 100).toFixed(2) + ') is due ' + inv.due_date + '. Pay: ' + appUrl + '/portal?project=' + inv.project_id)
        await supabase.from('invoices').update({ last_reminder_sent_at: new Date().toISOString() }).eq('id', inv.id)
      }
    }
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, created_at, project_id, author_id')
    .gte('created_at', yesterday)

  if (comments && resendKey) {
    const notified = new Set()
    for (const c of comments) {
      const { data: proj } = await supabase.from('projects').select('name, freelancer_id').eq('id', c.project_id).single()
      const { data: author } = await supabase.from('profiles').select('full_name, role, email').eq('id', c.author_id).single()
      if (!proj || !author) continue

      const notifyId = author.role === 'freelancer' ? await getClient(supabase, c.project_id) : proj.freelancer_id
      if (!notifyId || notified.has(notifyId + '-' + c.project_id)) continue
      notified.add(notifyId + '-' + c.project_id)

      const { data: notifyUser } = await supabase.from('profiles').select('email').eq('id', notifyId).single()
      if (notifyUser?.email) {
        await send(resendKey, fromEmail, fromName, notifyUser.email,
          'New activity on ' + proj.name,
          (author.full_name ?? 'Someone') + ' commented on ' + proj.name + ': ' + c.body + '\n\nView: ' + appUrl + '/portal?project=' + c.project_id)
      }
    }
  }

  return new Response('OK', { status: 200 })
})

async function send(key: string, fromEmail: string, fromName: string, to: string, subject: string, text: string) {
  try {
    await fetch(RESEND_API, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromName + ' <' + fromEmail + '>', to: [to], subject, text }),
    })
  } catch { /* noop */ }
}

async function getClient(supabase: ReturnType<typeof createClient>, projectId: string) {
  const { data } = await supabase.from('project_clients').select('client_id').eq('project_id', projectId).limit(1).single()
  return data?.client_id ?? null
}
