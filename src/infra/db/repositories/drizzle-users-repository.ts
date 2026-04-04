import type { UsersRepository } from '@/app/users/users.repository'
import type { User, UserInsert, UserUpdate } from '@/app/users/users.types'
import { db } from '@/infra/db'
import { users } from '@/infra/db/schemas'
import { eq } from 'drizzle-orm'

export class DrizzleUsersRepository implements UsersRepository {
	async create(data: UserInsert): Promise<User> {
		const [user] = await db.insert(users).values(data).returning()
		return user
	}

	async findById(id: string): Promise<User | undefined> {
		const [user] = await db.select().from(users).where(eq(users._id, id))
		return user
	}

	async findByEmail(email: string): Promise<User | undefined> {
		const [user] = await db.select().from(users).where(eq(users.email, email))
		return user
	}

	async findAll(): Promise<User[]> {
		return db.select().from(users)
	}

	async update(id: string, data: UserUpdate): Promise<User | undefined> {
		const [user] = await db
			.update(users)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(users._id, id))
			.returning()
		return user
	}

	async delete(id: string): Promise<{ userId: string }> {
		await db.delete(users).where(eq(users._id, id))
		return { userId: id }
	}
}
