import type { Link } from '../contracts'
import type { LinksRepository } from '../repositories'
import { failure, type Result, success } from '../shared/result'
import { LinkNotFoundError } from './errors'

export type GetLinkUseCase = (shortCode: string) => Promise<Result<Link, LinkNotFoundError>>

export function makeGetLinkUseCase(repository: LinksRepository): GetLinkUseCase {
  return async (shortCode) => {
    const link = await repository.findByShortCode(shortCode)

    if (!link) {
      return failure(new LinkNotFoundError())
    }

    return success(link)
  }
}
