import type { CreateLinkBody, Link as LinkRecord } from '@brev-ly/server/contracts'
import { useEffect, useState, useTransition } from 'react'

import {
  ApiRequestError,
  createLink,
  deleteLink,
  exportLinks,
  listLinks,
} from '../http/actions/links'

export function useLinks() {
  const [links, setLinks] = useState<LinkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    void listLinks()
      .then((loadedLinks) => {
        startTransition(() => setLinks(loadedLinks))
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  async function addLink(values: CreateLinkBody) {
    setError(null)
    try {
      const link = await createLink(values)
      startTransition(() => setLinks((current) => [link, ...current]))
    } catch (cause) {
      setError(
        cause instanceof ApiRequestError && cause.code === 'SHORT_CODE_ALREADY_EXISTS'
          ? 'Esse link encurtado já existe.'
          : 'Confira os dados e tente novamente.',
      )
    }
  }

  async function removeLink(shortCode: string) {
    setError(null)
    try {
      await deleteLink(shortCode)
      startTransition(() =>
        setLinks((current) => current.filter((link) => link.shortCode !== shortCode)),
      )
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

  return { addLink, downloadCsv, error, isPending, links, loading, removeLink }
}
