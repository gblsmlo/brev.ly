import { z } from 'zod'

const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{3,30}$/

export const shortCodeSchema = z
  .string()
  .regex(
    SHORT_CODE_PATTERN,
    'Encurtamento inválido: use entre 3 e 30 caracteres, apenas letras, números, hífen ou sublinhado.',
  )

export const httpUrlSchema = z
  .url('Informe uma URL válida.')
  .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), {
    message: 'A URL deve usar o protocolo HTTP ou HTTPS.',
  })

export const linkSchema = z
  .object({
    id: z.uuid(),
    originalUrl: httpUrlSchema,
    shortCode: shortCodeSchema,
    shortUrl: httpUrlSchema,
    accessCount: z.number().int().nonnegative(),
    createdAt: z.iso.datetime(),
  })
  .strict()

export const createLinkBodySchema = z
  .object({
    originalUrl: httpUrlSchema,
    shortCode: shortCodeSchema,
  })
  .strict()

export const shortCodeParamsSchema = z
  .object({
    shortCode: shortCodeSchema,
  })
  .strict()

export const listLinksQuerySchema = z
  .object({
    cursor: z.string().min(1).max(512).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict()

export const listLinksResponseSchema = z
  .object({
    items: z.array(linkSchema),
    nextCursor: z.string().min(1).max(512).nullable(),
  })
  .strict()

export const incrementLinkAccessResponseSchema = z
  .object({
    originalUrl: httpUrlSchema,
    accessCount: z.number().int().positive(),
  })
  .strict()

export const exportLinksResponseSchema = z
  .object({
    reportUrl: httpUrlSchema,
  })
  .strict()

export type Link = z.infer<typeof linkSchema>
export type CreateLinkBody = z.infer<typeof createLinkBodySchema>
export type ShortCodeParams = z.infer<typeof shortCodeParamsSchema>
export type ListLinksQuery = z.infer<typeof listLinksQuerySchema>
export type ListLinksResponse = z.infer<typeof listLinksResponseSchema>
export type IncrementLinkAccessResponse = z.infer<typeof incrementLinkAccessResponseSchema>
export type ExportLinksResponse = z.infer<typeof exportLinksResponseSchema>
