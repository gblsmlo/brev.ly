import type { CreateLinkBody, Link } from '../contracts'
import type { LinksRepository } from '../repositories'
import { ShortCodeAlreadyExistsError } from './errors'

export type CreateLinkUseCase = (input: CreateLinkBody) => Promise<Link>

export function makeCreateLinkUseCase(repository: LinksRepository): CreateLinkUseCase {
  return async (input) => {
    const existingLink = await repository.findByShortCode(input.shortCode)

    if (existingLink) {
      throw new ShortCodeAlreadyExistsError()
    }

    return repository.create(input)
  }
}
