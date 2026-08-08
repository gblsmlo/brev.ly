import type { ListLinksQuery, ListLinksResponse } from '../contracts'
import { InvalidLinksCursorRepositoryError, type LinksRepository } from '../repositories'
import { InvalidLinksCursorError } from './errors'

export type ListLinksUseCase = (query: ListLinksQuery) => Promise<ListLinksResponse>

export function makeListLinksUseCase(repository: LinksRepository): ListLinksUseCase {
  return async (query) => {
    try {
      return await repository.list(query)
    } catch (error) {
      if (error instanceof InvalidLinksCursorRepositoryError) {
        throw new InvalidLinksCursorError()
      }

      throw error
    }
  }
}
