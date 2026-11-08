// Sends a password-reset link to ADMIN_EMAIL. Same response whatever email is typed,
// so the endpoint can't be used to discover the admin address.
export default defineEventHandler(async (event) => {
  const { email } = (await readBody<{ email?: string }>(event)) || {}
  if (!emailConfigured()) throw createError({ statusCode: 503, statusMessage: 'Password reset by email is not set up yet.' })

  const ok = { ok: true, message: 'If that email belongs to the admin, a reset link is on its way. Check your inbox (and spam).' }
  if (String(email || '').trim().toLowerCase() !== adminEmail()) return ok

  // max one email per minute
  const storage = useStorage('db')
  const last = (await storage.getItem<number>('auth:reset-sent')) || 0
  if (Date.now() - last < 60e3) return ok
  await storage.setItem('auth:reset-sent', Date.now())

  const token = await createResetToken()
  const link = `${getRequestURL(event).origin}/admin/reset?token=${token}`
  const { brandName } = await getSettings()
  await sendEmail({
    to: adminEmail(),
    subject: `${brandName} admin: reset your password`,
    html: `<div style="font-family:system-ui,sans-serif;max-width:480px">
      <h2>Reset your admin password</h2>
      <p>Someone (hopefully you) asked to reset the admin password for <b>${escapeHtml(brandName)}</b>.</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#7c5cff;color:#fff;border-radius:999px;text-decoration:none">Choose a new password</a></p>
      <p style="color:#666;font-size:13px">This link works once and expires in 30 minutes. If you didn't request it, ignore this email — your password stays the same.</p>
    </div>`,
  })
  return ok
})
