import { EmailAlreadyInUseError, UserNotFoundError } from '@/app/users/error'
import { createUser, deleteUser, getUserById, listUsers, updateUser } from '@/app/users/use-cases'
import { DrizzleUsersRepository } from '@/infra/db/repositories/drizzle-users-repository'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const userSchema = z.object({
	_id: z.string(),
	createdAt: z.date(),
	email: z.string().nullable(),
	name: z.string(),
	updatedAt: z.date().nullable(),
})

export const usersRoutes: FastifyPluginAsyncZod = async (app) => {
	const repo = new DrizzleUsersRepository()

	app.post(
		'/users',
		{
			schema: {
				body: z.object({
					email: z.email(),
					name: z.string().min(1),
				}),
				response: {
					201: userSchema,
					409: z.object({ message: z.string() }),
				},
			},
		},
		async (req, reply) => {
			const result = await createUser(repo)(req.body)
			if (!result.success) {
				if (result.error instanceof EmailAlreadyInUseError) {
					return reply.status(409).send({ message: result.error.message })
				}
				throw result.error
			}
			return reply.status(201).send(result.data)
		},
	)

	app.get(
		'/users',
		{
			schema: {
				response: { 200: z.array(userSchema) },
			},
		},
		async (_, reply) => {
			const users = await listUsers(repo)()
			return reply.status(200).send(users)
		},
	)

	app.get(
		'/users/:id',
		{
			schema: {
				params: z.object({ id: z.uuid() }),
				response: {
					200: userSchema,
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (req, reply) => {
			const result = await getUserById(repo)(req.params.id)
			if (!result.success) {
				if (result.error instanceof UserNotFoundError) {
					return reply.status(404).send({ message: result.error.message })
				}
				throw result.error
			}
			return reply.status(200).send(result.data)
		},
	)

	app.patch(
		'/users/:id',
		{
			schema: {
				body: z
					.object({
						email: z.email().optional(),
						name: z.string().min(1).optional(),
					})
					.refine((data) => Object.keys(data).length > 0, {
						message: 'Body must not be empty',
					}),
				params: z.object({ id: z.uuid() }),
				response: {
					200: userSchema,
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (req, reply) => {
			const result = await updateUser(repo)({ data: req.body, id: req.params.id })
			if (result.success) {
				return reply.status(200).send(result.data)
			}

			if (result.error instanceof UserNotFoundError) {
				return reply.status(404).send({
					message: result.error.message,
				})
			}

			throw result.error
		},
	)

	app.delete(
		'/users/:id',
		{
			schema: {
				params: z.object({ id: z.uuid() }),
				response: {
					204: z.undefined(),
					404: z.object({ message: z.string() }),
				},
			},
		},
		async (req, reply) => {
			const result = await deleteUser(repo)(req.params.id)
			if (!result.success) {
				if (result.error instanceof UserNotFoundError) {
					return reply.status(404).send({ message: result.error.message })
				}
				throw result.error
			}
			return reply.status(204).send()
		},
	)
}
