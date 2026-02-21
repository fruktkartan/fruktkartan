import { createClient } from '../utils/db'

export default defineEventHandler(async _event => {
  const client = createClient()
  await client.connect()
  try {
    const result = await client.query('SELECT * FROM flags')
    return result.rows.map(x => ({
      ...x,
      tree: x.tree.trim(),
      flag: x.flag.trim(),
    }))
  } finally {
    await client.end()
  }
})
