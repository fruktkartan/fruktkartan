import { createClient } from '../../../utils/db'

export default defineEventHandler(async event => {
  const key = getRouterParam(event, 'key')
  const flag = getRouterParam(event, 'flag')

  const client = createClient()
  await client.connect()
  try {
    const result = await client.query(
      'DELETE FROM flags WHERE tree = $1 AND flag = $2',
      [key, flag],
    )
    if (result.rowCount === 0) {
      throw createError({ statusCode: 404, message: 'No such tree/flag' })
    }
    return sendNoContent(event)
  } finally {
    await client.end()
  }
})
