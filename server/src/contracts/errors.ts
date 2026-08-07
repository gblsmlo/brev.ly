import { z } from 'zod'

export const apiErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'SHORT_CODE_ALREADY_EXISTS',
  'LINK_NOT_FOUND',
  'EXPORT_FAILED',
  'INTERNAL_ERROR',
])

export const apiErrorSchema = z
  .object({
    code: apiErrorCodeSchema,
    message: z.string().min(1),
  })
  .strict()

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>
export type ApiError = z.infer<typeof apiErrorSchema>
