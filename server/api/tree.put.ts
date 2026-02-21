import murmurhash from 'murmurhash'
import { createClient } from '../utils/db'
import { isValidCoords, sanitizeText, userHash } from '../utils/helpers'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  if (!['lat', 'lon', 'type'].every(x => x in body)) {
    throw createError({
      statusCode: 400,
      message: 'Missing parameter! lat, lon and type are all required',
    })
  }
  if (!isValidCoords(body.lat, body.lon)) {
    throw createError({ statusCode: 400, message: 'Invalid coordinates' })
  }

  const lat = parseFloat(body.lat)
  const lon = parseFloat(body.lon)
  const type = body.type
  const desc = body.desc || ''
  // @ts-ignore — murmurhash typings are missing
  const key = murmurhash.v3('' + body.lat + body.lon, Date.now())
  const user_ip = userHash(event)
  const img = body.file || ''

  const client = createClient()
  await client.connect()
  try {
    await client.query(
      `INSERT INTO trees (ssm_key, description, img, type, added_by, point)
       VALUES ($1, $2, $3, $4, $5, ST_MakePoint($6, $7))`,
      [key, sanitizeText(desc), img, type, user_ip, lon, lat],
    )
    return { key }
  } finally {
    await client.end()
  }
})
