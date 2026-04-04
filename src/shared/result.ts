export type Result<T, E extends Error = Error> =
	| { success: true; data: T }
	| { success: false; error: E }

export const isSuccess = <T>(data: T): Result<T, never> => ({
	data,
	success: true,
})

export const isFailure = <E extends Error>(error: E): Result<never, E> => ({
	error,
	success: false,
})
