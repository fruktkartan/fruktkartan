import murmurhash from 'murmurhash'
import { getRequestHeader } from 'h3'
import type { H3Event } from 'h3'

export const isValidCoords = (lat: unknown, lon: unknown): boolean => {
  const flatLat = parseFloat(String(lat))
  const flatLon = parseFloat(String(lon))
  return (
    !isNaN(flatLat) &&
    !isNaN(flatLon) &&
    flatLat >= -90 &&
    flatLat <= 90 &&
    flatLon >= -180 &&
    flatLon <= 180
  )
}

export const sanitizeText = (rawText: string): string => {
  return rawText.replace(/<[^>]+>/g, '').normalize('NFC')
}

export const userHash = (event: H3Event): number => {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  const remote = event.node.req.socket?.remoteAddress ?? ''
  return murmurhash.v3(forwarded || remote)
}
