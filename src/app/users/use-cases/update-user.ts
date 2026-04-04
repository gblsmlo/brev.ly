import { isFailure, isSuccess, type Result } from '@shared/result'
import { UserNotFoundError } from '../error'
import type { UsersRepository } from '../users.repository'
import type { User, UserUpdate } from '../users.types'

type Output = {
	id: string
	data: UserUpdate
}

export const updateUser =
	(repo: UsersRepository) =>
	async ({ id, data }: Output): Promise<Result<User, UserNotFoundError>> => {
		const user = await repo.update(id, data)

		if (!user) return isFailure(new UserNotFoundError())

		return isSuccess(user)
	}
