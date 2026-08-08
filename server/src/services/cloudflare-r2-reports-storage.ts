import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import type { ReportsStorage } from './reports-storage'

interface R2Client {
  send(command: PutObjectCommand): Promise<unknown>
}

interface CreateCloudflareR2ReportsStorageOptions {
  accessKeyId: string
  accountId: string
  bucket: string
  client?: R2Client
  publicUrl: string
  secretAccessKey: string
}

export function createCloudflareR2ReportsStorage({
  accessKeyId,
  accountId,
  bucket,
  client,
  publicUrl,
  secretAccessKey,
}: CreateCloudflareR2ReportsStorageOptions): ReportsStorage {
  const basePublicUrl = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`
  const r2Client =
    client ??
    new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
    })

  return {
    async upload({ content, contentType, key }) {
      await r2Client.send(
        new PutObjectCommand({
          Body: content,
          Bucket: bucket,
          ContentType: contentType,
          Key: key,
        }),
      )

      return { url: new URL(key, basePublicUrl).toString() }
    },
  }
}
