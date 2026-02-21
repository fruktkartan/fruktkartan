import { createClient } from '../../utils/db'

export default defineEventHandler(async event => {
  const key = getRouterParam(event, 'key')
  if (!key) {
    throw createError({ statusCode: 400, message: 'Key missing' })
  }

  const client = createClient()
  await client.connect()
  try {
    const result = await client.query(
      `SELECT description, added_at, type, img
            , ST_Y(point) AS lat, ST_X(point) AS lon
         FROM trees
         WHERE ssm_key = $1`,
      [key],
    )

    if (!result.rows.length) {
      throw createError({
        statusCode: 404,
        message: `Could not find tree with id ${key}`,
      })
    }

    const tree = result.rows[0]
    return {
      type: tree.type.trim(),
      file: tree.img,
      desc: tree.description,
      added: tree.added_at,
      lat: tree.lat,
      lon: tree.lon,
    }
  } finally {
    await client.end()
  }
})
