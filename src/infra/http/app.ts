import { usersRoutes } from '@/infra/http/routes/users'
import { fastifyCors } from '@fastify/cors'
import { fastify } from 'fastify'
import {
	hasZodFastifySchemaValidationErrors,
	serializerCompiler,
	validatorCompiler,
} from 'fastify-type-provider-zod'

export async function buildApp() {
	const app = fastify()

	app.setValidatorCompiler(validatorCompiler)
	app.setSerializerCompiler(serializerCompiler)

	app.register(fastifyCors, { origin: '*' })

	app.setErrorHandler((error, _, reply) => {
		if (hasZodFastifySchemaValidationErrors(error)) {
			return reply.status(400).send({
				error: error.validation,
				message: 'Validation error',
			})
		}

		console.error(error)

		return reply.status(500).send({
			message: 'Internal server error',
		})
	})

	app.register(usersRoutes)

	return app
}
