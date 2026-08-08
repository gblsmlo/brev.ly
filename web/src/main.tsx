import { type FormEvent, StrictMode, useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Link as RouterLink, Routes, useParams } from 'react-router-dom'

import {
  ApiRequestError,
  createLink,
  deleteLink,
  exportLinks,
  getLink,
  incrementLinkAccess,
  listLinks,
} from './api'
import { webEnv } from './env'
import { routePaths } from './route-paths'
import './styles.css'

document.documentElement.dataset.backendUrl = webEnv.VITE_BACKEND_URL

const logo = (
  <RouterLink className="brand" to={routePaths.home} aria-label="Brev.ly - início">
    <span className="brand-mark" aria-hidden="true">
      ↗
    </span>
    <span>Brev.ly</span>
  </RouterLink>
)

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

function ApiAlert({ message }: { message: string }) {
  return (
    <p className="alert" role="alert">
      {message}
    </p>
  )
}

function HomePage() {
  const [links, setLinks] = useState<Awaited<ReturnType<typeof listLinks>>>([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadLinks = useCallback(async () => {
    setLoading(true)
    try {
      setLinks(await listLinks())
      setError(null)
    } catch {
      setError('Não foi possível carregar os links. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadLinks()
  }, [loadLinks])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!/^https?:\/\/\S+$/i.test(originalUrl)) {
      setError('Informe uma URL original válida.')
      return
    }

    if (!/^[A-Za-z0-9_-]{3,30}$/.test(shortCode)) {
      setError('O encurtamento informado é inválido.')
      return
    }

    setSubmitting(true)
    try {
      const link = await createLink({ originalUrl, shortCode })
      setLinks((current) => [link, ...current])
      setOriginalUrl('')
      setShortCode('')
    } catch (requestError) {
      if (
        requestError instanceof ApiRequestError &&
        requestError.code === 'SHORT_CODE_ALREADY_EXISTS'
      ) {
        setError('Já existe um link com esse encurtamento.')
      } else {
        setError('Não foi possível criar o link. Tente novamente.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(shortCodeToDelete: string) {
    setDeleting(shortCodeToDelete)
    setError(null)
    try {
      await deleteLink(shortCodeToDelete)
      setLinks((current) => current.filter((link) => link.shortCode !== shortCodeToDelete))
    } catch {
      setError('Não foi possível excluir o link. Tente novamente.')
    } finally {
      setDeleting(null)
    }
  }

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const reportUrl = await exportLinks()
      const anchor = document.createElement('a')
      anchor.href = reportUrl
      anchor.download = 'brevly-links.csv'
      anchor.target = '_blank'
      anchor.rel = 'noreferrer'
      anchor.click()
    } catch {
      setError('Não foi possível gerar o relatório CSV.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">{logo}</header>
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">LINKS MAIS CURTOS, IDEIAS MAIS LONGAS</p>
        <h1 id="page-title">Encurte seus links</h1>
        <p className="subtitle">Crie links curtos e acompanhe os acessos de forma simples.</p>
      </section>

      {error && <ApiAlert message={error} />}

      <section className="card create-card" aria-labelledby="create-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">NOVO LINK</p>
            <h2 id="create-title">Crie um link encurtado</h2>
          </div>
          <span className="section-icon" aria-hidden="true">
            ↗
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="original-url">URL original</label>
          <input
            id="original-url"
            name="originalUrl"
            placeholder="https://exemplo.com.br"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            disabled={submitting}
            required
          />
          <label htmlFor="short-code">URL encurtada</label>
          <div className="short-input">
            <span aria-hidden="true">brev.ly/</span>
            <input
              id="short-code"
              name="shortCode"
              placeholder="seu-link"
              value={shortCode}
              onChange={(event) => setShortCode(event.target.value)}
              disabled={submitting}
              required
            />
          </div>
          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? 'Criando…' : 'Criar link'}
          </button>
        </form>
      </section>

      <section className="links-section" aria-labelledby="links-title">
        <div className="section-heading list-heading">
          <div>
            <p className="section-kicker">SEUS LINKS</p>
            <h2 id="links-title">Links criados</h2>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting || loading}
          >
            {exporting ? 'Gerando…' : 'Baixar CSV'}
          </button>
        </div>
        {loading ? (
          <div className="loading-state" data-testid="links-loading" aria-live="polite">
            Carregando links…
          </div>
        ) : links.length === 0 ? (
          <div className="empty-state" data-testid="links-empty-state">
            <span className="empty-icon" aria-hidden="true">
              ↗
            </span>
            <strong>Você ainda não criou nenhum link</strong>
            <span>Seus links encurtados aparecerão aqui.</span>
          </div>
        ) : (
          <div className="link-list">
            {links.map((link) => (
              <article className="link-item" key={link.id}>
                <div className="link-info">
                  <a href={link.shortUrl} target="_blank" rel="noreferrer">
                    {link.shortCode}
                  </a>
                  <span>{link.originalUrl}</span>
                  <small>
                    {link.accessCount} acesso{link.accessCount === 1 ? '' : 's'} ·{' '}
                    {formatDate(link.createdAt)}
                  </small>
                </div>
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`Excluir ${link.shortCode}`}
                  onClick={() => void handleDelete(link.shortCode)}
                  disabled={deleting === link.shortCode}
                >
                  {deleting === link.shortCode ? '…' : 'Excluir'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function RedirectPage() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!shortCode) return
    const code = shortCode

    let cancelled = false
    async function redirect() {
      try {
        const link = await getLink(code)
        await incrementLinkAccess(code)
        if (!cancelled) window.location.assign(link.originalUrl)
      } catch {
        if (!cancelled) setNotFound(true)
      }
    }

    void redirect()
    return () => {
      cancelled = true
    }
  }, [shortCode])

  if (notFound) return <NotFoundPage />

  return (
    <main className="centered-page">
      <span className="spinner" aria-hidden="true" />
      <h1>Redirecionando…</h1>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="centered-page">
      {logo}
      <span className="not-found-code">404</span>
      <h1>Recurso não encontrado</h1>
      <p>O link que você tentou acessar não existe ou foi removido.</p>
      <RouterLink className="primary-button link-button" to={routePaths.home}>
        Voltar para a página inicial
      </RouterLink>
    </main>
  )
}

const root = document.getElementById('root')

if (!root) throw new Error('Root element was not found')

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
