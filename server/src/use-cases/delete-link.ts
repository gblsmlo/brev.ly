import type { LinksRepository } from '../repositories'
import { failure, type Result, success } from '../shared/result'
import { LinkNotFoundError } from './errors'

export type DeleteLinkUseCase = (shortCode: string) => Promise<Result<void, LinkNotFoundError>>

export function makeDeleteLinkUseCase(repository: LinksRepository): DeleteLinkUseCase {
  return async (shortCode) => {
    const deleted = await repository.deleteByShortCode(shortCode)

    if (!deleted) {
      return failure(new LinkNotFoundError())
    }

    return success(undefined)
  }
}
