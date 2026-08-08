export interface UploadReportInput {
  content: string
  contentType: 'text/csv; charset=utf-8'
  key: string
}

export interface ReportsStorage {
  upload(input: UploadReportInput): Promise<{ url: string }>
}
