export class EmailAlreadyInUseError extends Error {
	constructor() {
		super('Email already in use')
	}
}

export class UserNotFoundError extends Error {
	constructor() {
		super('User not found')
	}
}
