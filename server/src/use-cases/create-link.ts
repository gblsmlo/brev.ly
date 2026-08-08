import type { CreateLinkBody, Link } from '../contracts'
import { DuplicateShortCodeRepositoryError, type LinksRepository } from '../repositories'
import { failure, type Result, success } from '../shared/result'
import { ShortCodeAlreadyExistsError } from './errors'

export type CreateLinkUseCase = (
  input: CreateLinkBody,
) => Promise<Result<Link, ShortCodeAlreadyExistsError>>

export function makeCreateLinkUseCase(repository: LinksRepository): CreateLinkUseCase {
  return async (input) => {
    const existingLink = await repository.findByShortCode(input.shortCode)

    if (existingLink) {
      return failure(new ShortCodeAlreadyExistsError())
    }

    try {
      return success(await repository.create(input))
    } catch (error) {
      if (error instanceof DuplicateShortCodeRepositoryError) {
        return failure(new ShortCodeAlreadyExistsError())
      }

      throw error
    }
  }
}
