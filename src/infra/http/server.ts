import { env } from '@/infra/env'
import { buildApp } from './app'

buildApp().then((app) => {
	app.listen({ host: env.HOST, port: env.PORT }).then(() => {
		console.log(`🚀 HTTP server running on http://${env.HOST}:${env.PORT}`)
	})
})
