export default defineEventHandler(async (event) => {
  return { admin: await isAdmin(event), emailReset: emailConfigured() }
})
