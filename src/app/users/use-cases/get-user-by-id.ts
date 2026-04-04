import { UserNotFoundError } from '@/app/users/error'
import type { UsersRepository } from '@/app/users/users.repository'
import type { User } from '@/app/users/users.types'
import { isFailure, isSuccess, type Result } from '@shared/result'

export const getUserById =
	(repo: UsersRepository) =>
	async (id: string): Promise<Result<User, UserNotFoundError>> => {
		const user = await repo.findById(id)

		if (!user) return isFailure(new UserNotFoundError())

		return isSuccess(user)
	}
