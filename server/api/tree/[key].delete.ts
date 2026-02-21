import { createClient } from '../../utils/db'

export default defineEventHandler(async event => {
  const key = getRouterParam(event, 'key')

  const client = createClient()
  await client.connect()
  try {
    // Must delete flags first due to DB constraint
    await client.query('DELETE FROM flags WHERE tree = $1', [key])

    const result = await client.query('DELETE FROM trees WHERE ssm_key = $1', [key])
    if (result.rowCount === 0) {
      throw createError({ statusCode: 404, message: `No such tree to delete: ${key}` })
    }
    return sendNoContent(event)
  } finally {
    await client.end()
  }
})
