import { createClient } from '../../../utils/db'
import { sanitizeText, userHash } from '../../../utils/helpers'

const ALLOWED_FLAGS = ['delete', 'test']

export default defineEventHandler(async event => {
  const key = getRouterParam(event, 'key')
  const flag = getRouterParam(event, 'flag')

  if (!key) throw createError({ statusCode: 400, message: 'Missing key!' })
  if (!flag) throw createError({ statusCode: 400, message: 'Missing flag!' })
  if (!ALLOWED_FLAGS.includes(flag)) {
    throw createError({
      statusCode: 400,
      message: `Invalid flag (${flag}). Must be one of ${ALLOWED_FLAGS}`,
    })
  }

  const body = await readBody(event)
  const reason = body?.reason || ''
  const user = userHash(event)

  const client = createClient()
  await client.connect()
  try {
    const result = await client.query(
      'INSERT INTO flags (flagged_by, tree, flag, reason) VALUES ($1, $2, $3, $4)',
      [user, key, flag, sanitizeText(reason)],
    )
    if (!result.rowCount) {
      throw createError({
        statusCode: 404,
        message: `Nothing to update for tree ${key}`,
      })
    }
    return sendNoContent(event)
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({
      statusCode: 500,
      message:
        'Temporary technical error, or the tree has already been deleted or flagged.',
    })
  } finally {
    await client.end()
  }
})
