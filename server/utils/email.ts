/**
 * Sends email through Resend (free tier: resend.com). Needs RESEND_API_KEY.
 * Without a verified domain, Resend's test sender can only deliver to the email
 * address of your Resend account — perfect for admin emails.
 */
export const emailConfigured = () => !!process.env.RESEND_API_KEY && !!adminEmail()

export async function sendEmail(opts: { to: string, subject: string, html: string, replyTo?: string }) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw createError({ statusCode: 503, statusMessage: 'Email is not configured' })
  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: {
      from: process.env.EMAIL_FROM || 'Orbit Admin <onboarding@resend.dev>',
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
    },
  })
}

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]!)
