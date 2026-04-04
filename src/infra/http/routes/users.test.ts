import path from 'node:path'
import { db } from '@/infra/db'
import { users } from '@/infra/db/schemas'
import { buildApp } from '@/infra/http/app'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

const migrationsFolder = path.resolve(process.cwd(), 'src/infra/db/migrations')

let app: FastifyInstance

beforeAll(async () => {
	await migrate(db, { migrationsFolder })
	app = await buildApp()
	await app.ready()
})

beforeEach(async () => {
	await db.delete(users)
})

afterAll(async () => {
	await app.close()
})

// ─── POST /users ────────────────────────────────────────────────────────────

describe('POST /users', () => {
	it('201 — creates a user successfully', async () => {
		const response = await app.inject({
			body: { email: 'gabriel@example.com', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})

		expect(response.statusCode).toBe(201)
		const body = response.json()
		expect(body).toMatchObject({ email: 'gabriel@example.com', name: 'Gabriel' })
		expect(body._id).toBeDefined()
	})

	it('409 — rejects duplicate email', async () => {
		await app.inject({
			body: { email: 'gabriel@example.com', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})

		const response = await app.inject({
			body: { email: 'gabriel@example.com', name: 'Outro' },
			method: 'POST',
			url: '/users',
		})

		expect(response.statusCode).toBe(409)
		expect(response.json()).toMatchObject({ message: 'Email already in use' })
	})

	it('400 — rejects invalid payload (missing name)', async () => {
		const response = await app.inject({
			body: { email: 'gabriel@example.com' },
			method: 'POST',
			url: '/users',
		})

		expect(response.statusCode).toBe(400)
	})

	it('400 — rejects invalid email format', async () => {
		const response = await app.inject({
			body: { email: 'not-an-email', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})

		expect(response.statusCode).toBe(400)
	})
})

describe('GET /users', () => {
	it('200 — returns empty array when no users', async () => {
		const response = await app.inject({ method: 'GET', url: '/users' })

		expect(response.statusCode).toBe(200)
		expect(response.json()).toEqual([])
	})

	it('200 — returns all users', async () => {
		await app.inject({
			body: { email: 'gabriel@example.com', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})
		await app.inject({
			body: { email: 'maria@example.com', name: 'Maria' },
			method: 'POST',
			url: '/users',
		})

		const response = await app.inject({ method: 'GET', url: '/users' })

		expect(response.statusCode).toBe(200)
		expect(response.json()).toHaveLength(2)
	})
})

describe('GET /users/:id', () => {
	it('200 — returns user by id', async () => {
		const created = await app.inject({
			body: { email: 'gabriel@example.com', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})
		const { _id } = created.json()

		const response = await app.inject({ method: 'GET', url: `/users/${_id}` })

		expect(response.statusCode).toBe(200)
		expect(response.json()).toMatchObject({ _id, name: 'Gabriel' })
	})

	it('404 — returns not found for unknown id', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/users/00000000-0000-0000-0000-000000000000',
		})

		expect(response.statusCode).toBe(404)
		expect(response.json()).toMatchObject({ message: 'User not found' })
	})

	it('400 — rejects invalid UUID format', async () => {
		const response = await app.inject({ method: 'GET', url: '/users/not-a-uuid' })

		expect(response.statusCode).toBe(400)
	})
})

describe('PATCH /users/:id', () => {
	it('200 — updates user name', async () => {
		const created = await app.inject({
			body: { email: 'gabriel@example.com', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})
		const { _id } = created.json()

		const response = await app.inject({
			body: { name: 'Gabriel Melo' },
			method: 'PATCH',
			url: `/users/${_id}`,
		})

		expect(response.statusCode).toBe(200)
		expect(response.json()).toMatchObject({ name: 'Gabriel Melo' })
	})

	it('404 — returns not found for unknown id', async () => {
		const response = await app.inject({
			body: { name: 'Novo Nome' },
			method: 'PATCH',
			url: '/users/00000000-0000-0000-0000-000000000000',
		})

		expect(response.statusCode).toBe(404)
	})

	it('400 — rejects empty body', async () => {
		const created = await app.inject({
			body: { email: 'gabriel@example.com', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})
		const { _id } = created.json()

		const response = await app.inject({
			body: {},
			method: 'PATCH',
			url: `/users/${_id}`,
		})

		expect(response.statusCode).toBe(400)
	})
})

describe('DELETE /users/:id', () => {
	it('204 — deletes user successfully', async () => {
		const created = await app.inject({
			body: { email: 'gabriel@example.com', name: 'Gabriel' },
			method: 'POST',
			url: '/users',
		})
		const { _id } = created.json()

		const deleteResponse = await app.inject({ method: 'DELETE', url: `/users/${_id}` })
		expect(deleteResponse.statusCode).toBe(204)

		const getResponse = await app.inject({ method: 'GET', url: `/users/${_id}` })
		expect(getResponse.statusCode).toBe(404)
	})

	it('404 — returns not found for unknown id', async () => {
		const response = await app.inject({
			method: 'DELETE',
			url: '/users/00000000-0000-0000-0000-000000000000',
		})

		expect(response.statusCode).toBe(404)
	})
})
