export const healthStatus = {
  status: 'ok',
} as const

export type HealthStatus = typeof healthStatus
export type GetHealthUseCase = () => HealthStatus

export const getHealth: GetHealthUseCase = () => healthStatus
