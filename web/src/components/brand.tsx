import { Link } from 'react-router-dom'

import { routePaths } from '../route-paths'

export function Brand() {
  return (
    <Link className="brand" to={routePaths.home} aria-label="brev.ly início">
      <span aria-hidden="true">⛓</span>
      <strong>brev.ly</strong>
    </Link>
  )
}
