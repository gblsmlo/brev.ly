export class ShortCodeAlreadyExistsError extends Error {
  constructor() {
    super('Já existe um link com esse encurtamento.')
    this.name = 'ShortCodeAlreadyExistsError'
  }
}
