import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@app': path.resolve(__dirname, 'src/app'),
			'@infra': path.resolve(__dirname, 'src/infra'),
			'@shared': path.resolve(__dirname, 'src/shared'),
		},
	},
	test: {
		env: {
			DATABASE_URL: 'postgresql://docker:docker@localhost:5432/tc96',
			NODE_ENV: 'test',
		},
		testTimeout: 30000,
	},
})
