import type { User, UserInsert, UserUpdate } from './users.types'

export interface UsersRepository {
	create(data: UserInsert): Promise<User>
	findById(id: string): Promise<User | undefined>
	findByEmail(email: string): Promise<User | undefined>
	findAll(): Promise<User[]>
	update(id: string, data: UserUpdate): Promise<User | undefined>
	delete(id: string): Promise<{ userId: string }>
}
