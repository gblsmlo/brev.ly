import type { LinksRepository } from '../repositories'
import { LinkNotFoundError } from './errors'

export type DeleteLinkUseCase = (shortCode: string) => Promise<void>

export function makeDeleteLinkUseCase(repository: LinksRepository): DeleteLinkUseCase {
  return async (shortCode) => {
    const deleted = await repository.deleteByShortCode(shortCode)

    if (!deleted) {
      throw new LinkNotFoundError()
    }
  }
}
