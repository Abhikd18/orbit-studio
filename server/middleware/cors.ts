// Lets the native mobile app (Capacitor webview) read the public API.
const ALLOWED = ['capacitor://localhost', 'https://localhost', 'http://localhost', 'ionic://localhost']

export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/') || event.path.startsWith('/api/admin')) return
  const origin = getRequestHeader(event, 'origin')
  if (origin && ALLOWED.some(o => origin === o || origin.startsWith(o + ':'))) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    })
    if (event.method === 'OPTIONS') {
      setResponseStatus(event, 204)
      return ''
    }
  }
})
