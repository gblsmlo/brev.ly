import { useParams } from 'react-router-dom'

import { Brand } from '../components/brand'
import { Centered } from '../components/centered'
import { webEnv } from '../env'
import { useRedirect } from '../hooks/use-redirect'
import { NotFoundPage } from './not-found-page'

export function RedirectPage() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const { failed } = useRedirect(shortCode)

  if (failed) return <NotFoundPage />
  return (
    <Centered>
      <Brand />
      <h1>Redirecionando...</h1>
      <p>O link será aberto automaticamente em alguns instantes.</p>
      <p>
        Não foi redirecionado? <a href={webEnv.VITE_FRONTEND_URL}>Acesse aqui</a>
      </p>
    </Centered>
  )
}
