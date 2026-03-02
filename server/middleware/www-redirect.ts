export default defineEventHandler((event) => {
  const host = getHeader(event, "host") ?? ""
  if (host.startsWith("www.")) {
    const apex = host.slice(4)
    const url = getRequestURL(event)
    return sendRedirect(
      event,
      `${url.protocol}//${apex}${url.pathname}${url.search}`,
      301,
    )
  }
})
