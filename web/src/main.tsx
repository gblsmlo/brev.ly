import type { Link as LinkRecord } from '@brev-ly/server/contracts'
import { type FormEvent, StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'

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

function Brand() {
  return (
    <Link className="brand" to={routePaths.home} aria-label="brev.ly início">
      <span aria-hidden="true">⛓</span>
      <strong>brev.ly</strong>
    </Link>
  )
}

function HomePage() {
  const [links, setLinks] = useState<LinkRecord[]>([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listLinks()
      .then(setLinks)
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const link = await createLink({ originalUrl, shortCode })
      setLinks((current) => [link, ...current])
      setOriginalUrl('')
      setShortCode('')
    } catch (cause) {
      setError(
        cause instanceof ApiRequestError && cause.code === 'SHORT_CODE_ALREADY_EXISTS'
          ? 'Esse link encurtado já existe.'
          : 'Confira os dados e tente novamente.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function remove(short: string) {
    setError(null)
    try {
      await deleteLink(short)
      setLinks((current) => current.filter((link) => link.shortCode !== short))
    } catch {
      setError('Não foi possível excluir este link.')
    }
  }

  async function downloadCsv() {
    try {
      const url = await exportLinks()
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Não foi possível gerar o CSV.')
    }
  }

  return (
    <main className="app-shell">
      <Brand />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="dashboard">
        <section className="panel new-link" aria-labelledby="new-link-title">
          <h1 id="new-link-title">Novo link</h1>
          <form onSubmit={submit}>
            <label htmlFor="original-url">LINK ORIGINAL</label>
            <input
              id="original-url"
              type="url"
              placeholder="www.exemplo.com.br"
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              required
            />
            <label htmlFor="short-code">LINK ENCURTADO</label>
            <div className="short-code">
              <span>brev.ly/</span>
              <input
                id="short-code"
                placeholder="seu-link"
                value={shortCode}
                onChange={(event) => setShortCode(event.target.value)}
                required
              />
            </div>
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar link'}
            </button>
          </form>
        </section>
        <section className="panel my-links" aria-labelledby="my-links-title">
          <header className="panel-header">
            <h2 id="my-links-title">Meus links</h2>
            <button
              className="button export"
              type="button"
              onClick={() => void downloadCsv()}
              disabled={loading || links.length === 0}
            >
              ⇩&nbsp; Baixar CSV
            </button>
          </header>
          {loading ? (
            <p className="empty-copy">Carregando…</p>
          ) : links.length === 0 ? (
            <div className="empty-copy">
              <span className="empty-icon" aria-hidden="true">
                ⛓
              </span>
              <span>AINDA NÃO EXISTEM LINKS CADASTRADOS</span>
            </div>
          ) : (
            <div className="link-list">
              {links.map((link) => (
                <article className="link-row" key={link.id}>
                  <div>
                    <a href={link.shortUrl} target="_blank" rel="noreferrer">
                      brev.ly/{link.shortCode}
                    </a>
                    <p>{link.originalUrl}</p>
                  </div>
                  <span className="accesses">{link.accessCount} acessos</span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label={`Copiar ${link.shortCode}`}
                    onClick={() => void navigator.clipboard?.writeText(link.shortUrl)}
                  >
                    ▣
                  </button>
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label={`Excluir ${link.shortCode}`}
                    onClick={() => void remove(link.shortCode)}
                  >
                    ♜
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function RedirectPage() {
  const { shortCode } = useParams<{ shortCode: string }>()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!shortCode) return
    void getLink(shortCode)
      .then((link) =>
        incrementLinkAccess(shortCode).then(() => window.location.assign(link.originalUrl)),
      )
      .catch(() => setFailed(true))
  }, [shortCode])
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

function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Centered>
      <span className="not-found-code" aria-hidden="true">
        404
      </span>
      <h1>Link não encontrado</h1>
      <p>
        O link que você está tentando acessar não existe, foi removido ou é uma URL inválida. Saiba
        mais em <a href={webEnv.VITE_FRONTEND_URL}>brev.ly</a>.
      </p>
      <button className="button primary" type="button" onClick={() => navigate(routePaths.home)}>
        Voltar para o início
      </button>
    </Centered>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <main className="centered">{children}</main>
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
