import type { ListLinksQuery, ListLinksResponse } from '../contracts'
import { InvalidLinksCursorRepositoryError, type LinksRepository } from '../repositories'
import { failure, type Result, success } from '../shared/result'
import { InvalidLinksCursorError } from './errors'

export type ListLinksUseCase = (
  query: ListLinksQuery,
) => Promise<Result<ListLinksResponse, InvalidLinksCursorError>>

export function makeListLinksUseCase(repository: LinksRepository): ListLinksUseCase {
  return async (query) => {
    try {
      return success(await repository.list(query))
    } catch (error) {
      if (error instanceof InvalidLinksCursorRepositoryError) {
        return failure(new InvalidLinksCursorError())
      }

      throw error
    }
  }
}
