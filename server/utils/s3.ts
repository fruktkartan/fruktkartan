import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export async function getSignedRequest(key: string, bucket: string, region: string) {
  const accessKeyId = process.env.S3_ACCESS_KEY
  const secretAccessKey = process.env.S3_SECRET_KEY

  const client = new S3Client({
    region,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  })

  const command = new PutObjectCommand({ Bucket: bucket, Key: key })
  const url = await getSignedUrl(client, command, { expiresIn: 3600 })

  return {
    filename: key,
    signedRequest: url,
    url: `https://${bucket}.s3.amazonaws.com/${key}`,
  }
}
