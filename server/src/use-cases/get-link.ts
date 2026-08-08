import type { Link } from '../contracts'
import type { LinksRepository } from '../repositories'
import { LinkNotFoundError } from './errors'

export type GetLinkUseCase = (shortCode: string) => Promise<Link>

export function makeGetLinkUseCase(repository: LinksRepository): GetLinkUseCase {
  return async (shortCode) => {
    const link = await repository.findByShortCode(shortCode)

    if (!link) {
      throw new LinkNotFoundError()
    }

    return link
  }
}
