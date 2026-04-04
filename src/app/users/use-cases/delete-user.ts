import { UserNotFoundError } from '@/app/users/error'
import type { UsersRepository } from '@/app/users/users.repository'
import { isFailure, isSuccess, type Result } from '@shared/result'

export const deleteUser =
	(repo: UsersRepository) =>
	async (id: string): Promise<Result<{ userId: string }, UserNotFoundError>> => {
		const user = await repo.findById(id)

		if (!user) {
			return isFailure(new UserNotFoundError())
		}

		const deleted = await repo.delete(id)

		return isSuccess(deleted)
	}
