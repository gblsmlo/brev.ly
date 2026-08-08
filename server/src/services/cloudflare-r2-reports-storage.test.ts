import { describe, expect, test } from 'bun:test'
import type { PutObjectCommand } from '@aws-sdk/client-s3'

import { createCloudflareR2ReportsStorage } from './cloudflare-r2-reports-storage'

describe('Cloudflare R2 reports storage', () => {
  test('BE-T18 uploads the CSV and returns its public CDN URL', async () => {
    const commands: PutObjectCommand[] = []
    const storage = createCloudflareR2ReportsStorage({
      accessKeyId: 'access-key',
      accountId: 'account-id',
      bucket: 'reports-bucket',
      client: {
        async send(command) {
          commands.push(command)
          return {}
        },
      },
      publicUrl: 'https://cdn.example.com',
      secretAccessKey: 'secret-key',
    })

    const result = await storage.upload({
      content: 'original_url,short_url,access_count,created_at\n',
      contentType: 'text/csv; charset=utf-8',
      key: 'reports/random.csv',
    })

    expect(result.url).toBe('https://cdn.example.com/reports/random.csv')
    expect(commands).toHaveLength(1)
    expect(commands[0]?.input).toMatchObject({
      Body: 'original_url,short_url,access_count,created_at\n',
      Bucket: 'reports-bucket',
      ContentType: 'text/csv; charset=utf-8',
      Key: 'reports/random.csv',
    })
  })
})
