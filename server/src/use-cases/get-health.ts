import { type Success, success } from '../shared/result'

export const healthStatus = {
  status: 'ok',
} as const

export type HealthStatus = typeof healthStatus
export type GetHealthUseCase = () => Success<HealthStatus>

export const getHealth: GetHealthUseCase = () => success(healthStatus)
