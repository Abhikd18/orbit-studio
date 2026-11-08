export default defineEventHandler(async (event) => {
  const session = await adminSession(event)
  return { admin: !!session.data.admin }
})
