import type { Link as LinkRecord } from '@brev-ly/server/contracts'

type LinksPanelProps = {
  links: LinkRecord[]
  loading: boolean
  pending: boolean
  onDelete: (shortCode: string) => Promise<void>
  onExport: () => Promise<void>
}

export function LinksPanel({ links, loading, pending, onDelete, onExport }: LinksPanelProps) {
  return (
    <section className="panel my-links" aria-labelledby="my-links-title">
      <header className="panel-header">
        <h2 id="my-links-title">Meus links</h2>
        <button
          className="button export"
          type="button"
          onClick={() => void onExport()}
          disabled={loading || pending || links.length === 0}
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
                onClick={() => void onDelete(link.shortCode)}
                disabled={pending}
              >
                ♜
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
