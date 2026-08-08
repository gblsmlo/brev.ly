import { useEffect, useRef, useState } from 'react'

import { getLink, incrementLinkAccess } from '../http/actions/links'

export function useRedirect(shortCode: string | undefined) {
  const [failed, setFailed] = useState(false)
  const active = useRef(false)
  const startedShortCode = useRef<string | null>(null)

  useEffect(() => {
    active.current = true

    if (shortCode && startedShortCode.current !== shortCode) {
      startedShortCode.current = shortCode

      void getLink(shortCode)
        .then((link) =>
          incrementLinkAccess(shortCode).then(() => {
            if (active.current) window.location.assign(link.originalUrl)
          }),
        )
        .catch(() => {
          if (active.current) setFailed(true)
        })
    }

    return () => {
      active.current = false
    }
  }, [shortCode])

  return { failed }
}
