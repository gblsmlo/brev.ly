import { useNavigate } from 'react-router-dom'

import { Centered } from '../components/centered'
import { routePaths } from '../route-paths'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Centered>
      <span className="not-found-code" aria-hidden="true">
        404
      </span>
      <h1>Recurso não encontrado</h1>
      <p>O link que você está tentando acessar não existe, foi removido ou é uma URL inválida.</p>
      <button className="button primary" type="button" onClick={() => navigate(routePaths.home)}>
        Voltar para o início
      </button>
    </Centered>
  )
}
