import { useEffect, useState } from 'react'

import { getLink, incrementLinkAccess } from '../http/actions/links'

export function useRedirect(shortCode: string | undefined) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!shortCode) return
    let cancelled = false

    void getLink(shortCode)
      .then((link) =>
        incrementLinkAccess(shortCode).then(() => {
          if (!cancelled) window.location.assign(link.originalUrl)
        }),
      )
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [shortCode])

  return { failed }
}
