import { createClient } from '../utils/db'

export default defineEventHandler(async _event => {
  const client = createClient()
  await client.connect()
  try {
    const result = await client.query(
      `SELECT ssm_key, description, img, type
            , ST_Y(point) AS lat, ST_X(point) AS lon
            , added_at, added_by
         FROM trees
         ORDER BY added_at DESC`,
    )
    return result.rows.map(x => ({ ...x, ssm_key: x.ssm_key.trim() }))
  } finally {
    await client.end()
  }
})
