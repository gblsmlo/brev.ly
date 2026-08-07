import { describe, expect, test } from 'bun:test'

import { routePaths } from './route-paths'

describe('application routes', () => {
  test('declares the three pages required by the challenge', () => {
    expect(routePaths).toEqual({
      home: '/',
      redirect: '/:shortCode',
      notFound: '*',
    })
  })
})
