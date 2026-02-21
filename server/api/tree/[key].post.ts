import { createClient } from '../../utils/db'
import { isValidCoords, sanitizeText, userHash } from '../../utils/helpers'

export default defineEventHandler(async event => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, message: 'Missing key!' })
  }

  const body = await readBody(event)
  if (!body) {
    throw createError({ statusCode: 400, message: 'Request body missing!' })
  }

  let idx = 1
  const queryParts = ['UPDATE trees SET added_at = now()']
  const values: unknown[] = []

  queryParts.push(`, added_by = $${idx}`)
  values.push(userHash(event))
  idx++

  const idx_noparams = idx

  if ('type' in body) {
    queryParts.push(`, type = $${idx}`)
    values.push(body.type)
    idx++
  }
  if ('desc' in body) {
    queryParts.push(`, description = $${idx}`)
    values.push(sanitizeText(body.desc || ''))
    idx++
  }
  if ('file' in body) {
    queryParts.push(`, img = $${idx}`)
    values.push(body.file || '')
    idx++
  }
  if ('lat' in body && 'lon' in body) {
    if (!isValidCoords(body.lat, body.lon)) {
      throw createError({
        statusCode: 400,
        message: `Invalid coordinates: ${body.lat}, ${body.lon}`,
      })
    }
    queryParts.push(`, point = ST_MakePoint($${idx}, $${idx + 1})`)
    values.push(body.lon, body.lat)
    idx += 2
  }

  if (idx === idx_noparams) {
    throw createError({ statusCode: 400, message: 'Nothing to update' })
  }

  queryParts.push(` WHERE ssm_key = $${idx}`)
  values.push(key)

  const client = createClient()
  await client.connect()
  try {
    const result = await client.query(queryParts.join(' '), values as string[])
    if (!result.rowCount) {
      throw createError({
        statusCode: 404,
        message: `Nothing found to update for key ${key}`,
      })
    }
    return sendNoContent(event)
  } finally {
    await client.end()
  }
})
