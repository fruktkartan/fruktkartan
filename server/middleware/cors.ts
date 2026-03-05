const ALLOWED_ORIGINS = ["https://lublin.se"]

export default defineEventHandler((event) => {
  if (!event.path.startsWith("/api/")) return

  const origin = getHeader(event, "origin") ?? ""
  if (ALLOWED_ORIGINS.includes(origin)) {
    setHeader(event, "Access-Control-Allow-Origin", origin)
    setHeader(event, "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    setHeader(event, "Access-Control-Allow-Headers", "Content-Type")
  }

  if (event.method === "OPTIONS") {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})
