export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, string>>(event)
  const name = String(body?.name || '').trim().slice(0, 120)
  const email = String(body?.email || '').trim().slice(0, 200)
  const message = String(body?.message || '').trim().slice(0, 4000)
  const budget = String(body?.budget || '').trim().slice(0, 60)
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5)
    throw createError({ statusCode: 400, statusMessage: 'Please provide your name, a valid email and a message.' })
  const messages = await getCollection<any>('messages')
  messages.unshift({ id: uid(), name, email, budget, message, read: false, status: 'new', notes: [], createdAt: new Date().toISOString() })
  await saveCollection('messages', messages.slice(0, 500))

  // Email alert to the admin (only when Resend is configured). Never blocks the lead.
  if (emailConfigured()) {
    try {
      const origin = getRequestURL(event).origin
      await sendEmail({
        to: adminEmail(),
        replyTo: email,
        subject: `New enquiry from ${name}${budget ? ` · ${budget}` : ''}`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:560px">
          <h2>New enquiry</h2>
          <p><b>${escapeHtml(name)}</b> &lt;${escapeHtml(email)}&gt;${budget ? `<br>${escapeHtml(budget)}` : ''}</p>
          <p style="white-space:pre-wrap;background:#f5f5f7;padding:14px;border-radius:10px">${escapeHtml(message)}</p>
          <p>Reply to this email to answer directly, or <a href="${origin}/admin/leads">open your pipeline</a>.</p>
        </div>`,
      })
    }
    catch (e) {
      console.error('[orbit] lead email failed', e)
    }
  }
  return { ok: true }
})
