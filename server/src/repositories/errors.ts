export class DuplicateShortCodeRepositoryError extends Error {
  constructor() {
    super('The short code already exists in persistence.')
    this.name = 'DuplicateShortCodeRepositoryError'
  }
}
