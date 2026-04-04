import type { UsersRepository } from '@/app/users/users.repository'

export const listUsers = (repo: UsersRepository) => async () => {
	return repo.findAll()
}
