import { EmailAlreadyInUseError } from '@/app/users/error'
import type { UsersRepository } from '@/app/users/users.repository'
import type { User } from '@/app/users/users.types'
import { isFailure, isSuccess, type Result } from '@shared/result'

type Input = {
	name: string
	email: string
}

export const createUser =
	(repo: UsersRepository) =>
	async (payload: Input): Promise<Result<User, EmailAlreadyInUseError>> => {
		const existing = await repo.findByEmail(payload.email)

		if (existing) {
			return isFailure(new EmailAlreadyInUseError())
		}

		const user = await repo.create(payload)

		return isSuccess(user)
	}
