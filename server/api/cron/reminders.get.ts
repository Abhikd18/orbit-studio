// Daily follow-up reminder email (Vercel Cron, 9:00 IST). Vercel calls this with
// "Authorization: Bearer $CRON_SECRET"; anyone else gets 401.
export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  if (!secret || getRequestHeader(event, 'authorization') !== `Bearer ${secret}`)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  if (!emailConfigured()) return { ok: true, skipped: 'email not configured' }

  const today = istDate(new Date().toISOString())
  const leads = (await getCollection<any>('messages'))
    .filter(l => l.followUp && l.followUp <= today && !['won', 'lost'].includes(l.status))
    .sort((a, b) => a.followUp.localeCompare(b.followUp))
  if (!leads.length) return { ok: true, due: 0 }

  const origin = getRequestURL(event).origin
  const rows = leads.map(l => `<li style="margin-bottom:8px"><b>${escapeHtml(l.name)}</b> &lt;${escapeHtml(l.email)}&gt; — ${l.followUp < today ? `<span style="color:#e11d48">overdue since ${l.followUp}</span>` : 'due today'}${l.budget ? `<br><small>${escapeHtml(l.budget)}</small>` : ''}</li>`).join('')
  await sendEmail({
    to: adminEmail(),
    subject: `📌 ${leads.length} follow-up${leads.length > 1 ? 's' : ''} due today`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px"><h2>Follow-ups for today</h2><ul style="padding-left:18px">${rows}</ul><p><a href="${origin}/admin/leads">Open your pipeline</a></p></div>`,
  })
  return { ok: true, due: leads.length }
})
