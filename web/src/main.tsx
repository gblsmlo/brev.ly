import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { webEnv } from './env'
import { routePaths } from './route-paths'
import './styles.css'

document.documentElement.dataset.backendUrl = webEnv.VITE_BACKEND_URL

function HomePage() {
  return (
    <main>
      <p className="eyebrow">Brev.ly</p>
      <h1>Encurtador de links</h1>
      <p>A fundação está pronta. O cadastro e a listagem serão entregues na Fase 3.</p>
    </main>
  )
}

function RedirectPage() {
  return (
    <main>
      <h1>Redirecionando…</h1>
      <p>A resolução de links será conectada à API na Fase 3.</p>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main>
      <h1>Recurso não encontrado</h1>
      <a href="/">Voltar para a página inicial</a>
    </main>
  )
}

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element was not found')
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path={routePaths.home} element={<HomePage />} />
        <Route path={routePaths.redirect} element={<RedirectPage />} />
        <Route path={routePaths.notFound} element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
