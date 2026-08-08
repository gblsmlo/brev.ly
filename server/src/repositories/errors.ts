export class DuplicateShortCodeRepositoryError extends Error {
  constructor() {
    super('The short code already exists in persistence.')
    this.name = 'DuplicateShortCodeRepositoryError'
  }
}

export class LinkNotFoundRepositoryError extends Error {
  constructor() {
    super('The link was not found in persistence.')
    this.name = 'LinkNotFoundRepositoryError'
  }
}

export class InvalidLinksCursorRepositoryError extends Error {
  constructor() {
    super('The links cursor is invalid.')
    this.name = 'InvalidLinksCursorRepositoryError'
  }
}
