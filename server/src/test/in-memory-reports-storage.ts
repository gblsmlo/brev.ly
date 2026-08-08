import type { ReportsStorage, UploadReportInput } from '../services/reports-storage'

export class InMemoryReportsStorage implements ReportsStorage {
  readonly uploads: UploadReportInput[] = []

  async upload(input: UploadReportInput): Promise<{ url: string }> {
    this.uploads.push(input)
    return { url: `https://cdn.example.com/${input.key}` }
  }
}
