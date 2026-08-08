import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { webEnv } from './env'
import { HomePage } from './pages/home-page'
import { NotFoundPage } from './pages/not-found-page'
import { RedirectPage } from './pages/redirect-page'
import { routePaths } from './route-paths'
import './styles.css'

document.documentElement.dataset.backendUrl = webEnv.VITE_BACKEND_URL

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
