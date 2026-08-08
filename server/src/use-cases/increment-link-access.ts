import type { IncrementLinkAccessResponse } from '../contracts'
import { LinkNotFoundRepositoryError, type LinksRepository } from '../repositories'
import { LinkNotFoundError } from './errors'

export type IncrementLinkAccessUseCase = (shortCode: string) => Promise<IncrementLinkAccessResponse>

export function makeIncrementLinkAccessUseCase(
  repository: LinksRepository,
): IncrementLinkAccessUseCase {
  return async (shortCode) => {
    try {
      return await repository.incrementAccesses(shortCode)
    } catch (error) {
      if (error instanceof LinkNotFoundRepositoryError) {
        throw new LinkNotFoundError()
      }

      throw error
    }
  }
}
