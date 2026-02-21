import murmurhash from 'murmurhash'
import { getSignedRequest } from '../utils/s3'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const fileName = body['file-name']
  // @ts-ignore — murmurhash typings are missing
  const newFileName = murmurhash.v3(fileName, Date.now()) + '.' + fileName.split('.').pop()

  return await getSignedRequest(
    newFileName,
    process.env.S3_BUCKET || '',
    process.env.S3_REGION || '',
  )
})
