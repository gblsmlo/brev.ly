import type { IncrementLinkAccessResponse } from '../contracts'
import { LinkNotFoundRepositoryError, type LinksRepository } from '../repositories'
import { failure, type Result, success } from '../shared/result'
import { LinkNotFoundError } from './errors'

export type IncrementLinkAccessUseCase = (
  shortCode: string,
) => Promise<Result<IncrementLinkAccessResponse, LinkNotFoundError>>

export function makeIncrementLinkAccessUseCase(
  repository: LinksRepository,
): IncrementLinkAccessUseCase {
  return async (shortCode) => {
    try {
      return success(await repository.incrementAccesses(shortCode))
    } catch (error) {
      if (error instanceof LinkNotFoundRepositoryError) {
        return failure(new LinkNotFoundError())
      }

      throw error
    }
  }
}
