import { Brand } from '../components/brand'
import { LinkForm } from '../components/link-form'
import { LinksPanel } from '../components/links-panel'
import { useLinks } from '../hooks/use-links'

export function HomePage() {
  const { addLink, downloadCsv, error, isPending, links, loading, removeLink } = useLinks()

  return (
    <main className="app-shell">
      <Brand />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="dashboard">
        <LinkForm onSubmit={addLink} />
        <LinksPanel
          links={links}
          loading={loading}
          pending={isPending}
          onDelete={removeLink}
          onExport={downloadCsv}
        />
      </div>
    </main>
  )
}
