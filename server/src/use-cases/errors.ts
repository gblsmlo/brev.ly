export class ShortCodeAlreadyExistsError extends Error {
  constructor() {
    super('Já existe um link com esse encurtamento.')
    this.name = 'ShortCodeAlreadyExistsError'
  }
}

export class LinkNotFoundError extends Error {
  constructor() {
    super('O link informado não foi encontrado.')
    this.name = 'LinkNotFoundError'
  }
}

export class InvalidLinksCursorError extends Error {
  constructor() {
    super('O cursor informado é inválido.')
    this.name = 'InvalidLinksCursorError'
  }
}
