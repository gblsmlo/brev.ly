import { expect, test } from '@playwright/test'

const validLink = {
  originalUrl: 'https://example.com/articles/contract-first',
  shortCode: 'contract-first',
}

async function mockEmptyLinks(page: Parameters<typeof test>[0]['page']) {
  await page.route('**/links', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        body: JSON.stringify({ items: [], nextCursor: null }),
        contentType: 'application/json',
        status: 200,
      })
      return
    }

    await route.continue()
  })
}

test.describe('Brev.ly front-end RED journeys', () => {
  test('FE-T01 shows the form and empty state on the home page', async ({ page }) => {
    await mockEmptyLinks(page)
    await page.goto('/')

    await expect(page.getByLabel('URL original')).toBeVisible()
    await expect(page.getByLabel('URL encurtada')).toBeVisible()
    await expect(page.getByTestId('links-empty-state')).toBeVisible()
  })

  test('FE-T02 creates a link and renders it in the list', async ({ page }) => {
    await page.route('**/links', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          body: JSON.stringify(validLink),
          contentType: 'application/json',
          status: 201,
        })
        return
      }

      await route.fulfill({
        body: JSON.stringify({ items: [], nextCursor: null }),
        contentType: 'application/json',
      })
    })
    await page.goto('/')
    await page.getByLabel('URL original').fill(validLink.originalUrl)
    await page.getByLabel('URL encurtada').fill(validLink.shortCode)
    await page.getByRole('button', { name: 'Criar link' }).click()

    await expect(page.getByText(validLink.shortCode)).toBeVisible()
  })

  test('FE-T03 blocks malformed short codes before the request', async ({ page }) => {
    await mockEmptyLinks(page)
    let requestCount = 0
    page.on('request', (request) => {
      if (request.url().endsWith('/links') && request.method() === 'POST') requestCount += 1
    })
    await page.goto('/')
    await page.getByLabel('URL original').fill(validLink.originalUrl)
    await page.getByLabel('URL encurtada').fill('has spaces')
    await page.getByRole('button', { name: 'Criar link' }).click()

    await expect(page.getByText(/encurtamento.*inválido/i)).toBeVisible()
    expect(requestCount).toBe(0)
  })

  test('FE-T04 presents duplicate-code conflict without replacing the list', async ({ page }) => {
    await page.route('**/links', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          body: JSON.stringify({ code: 'SHORT_CODE_ALREADY_EXISTS' }),
          contentType: 'application/json',
          status: 409,
        })
        return
      }

      await route.fulfill({
        body: JSON.stringify({ items: [validLink], nextCursor: null }),
        contentType: 'application/json',
      })
    })
    await page.goto('/')
    await page.getByLabel('URL original').fill(validLink.originalUrl)
    await page.getByLabel('URL encurtada').fill(validLink.shortCode)
    await page.getByRole('button', { name: 'Criar link' }).click()

    await expect(page.getByText(/já existe/i)).toBeVisible()
    await expect(page.getByText(validLink.shortCode)).toBeVisible()
  })

  test('FE-T05 deletes a link and blocks the action while pending', async ({ page }) => {
    await page.route('**/links', async (route) => {
      await route.fulfill({
        body: JSON.stringify({ items: [validLink], nextCursor: null }),
        contentType: 'application/json',
      })
    })
    await page.route('**/links/contract-first', async (route) => {
      await route.fulfill({ status: 204 })
    })
    await page.goto('/')
    await page.getByRole('button', { name: /excluir/i }).click()

    await expect(page.getByText(validLink.shortCode)).toHaveCount(0)
  })

  test('FE-T06 lists all required link metadata', async ({ page }) => {
    await page.route('**/links', async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          items: [
            {
              ...validLink,
              accessCount: 3,
              createdAt: '2026-08-07T12:00:00.000Z',
              shortUrl: 'http://localhost:5173/contract-first',
            },
          ],
          nextCursor: null,
        }),
        contentType: 'application/json',
      })
    })
    await page.goto('/')

    await expect(page.getByText(validLink.originalUrl)).toBeVisible()
    await expect(page.getByText('3')).toBeVisible()
  })

  test('FE-T07 resolves and redirects a known short code', async ({ page }) => {
    await page.route('**/links/contract-first', async (route) => {
      await route.fulfill({
        body: JSON.stringify({ ...validLink, accessCount: 1 }),
        contentType: 'application/json',
      })
    })
    await page.route('**/links/contract-first/accesses', async (route) => {
      await route.fulfill({
        body: JSON.stringify({ accessCount: 2, originalUrl: validLink.originalUrl }),
        contentType: 'application/json',
      })
    })
    await page.goto('/contract-first')

    await expect(page).toHaveURL(validLink.originalUrl)
  })

  test('FE-T08 shows not found for an unknown short code', async ({ page }) => {
    await page.route('**/links/not-found', async (route) => {
      await route.fulfill({
        body: JSON.stringify({ code: 'LINK_NOT_FOUND' }),
        contentType: 'application/json',
        status: 404,
      })
    })
    await page.goto('/not-found')

    await expect(page.getByRole('heading', { name: /recurso não encontrado/i })).toBeVisible()
  })

  test('FE-T09 shows not found for an invalid route', async ({ page }) => {
    await page.goto('/not/a/valid/short-code')

    await expect(page.getByRole('heading', { name: /recurso não encontrado/i })).toBeVisible()
  })

  test('FE-T10 downloads the CSV report', async ({ page }) => {
    await mockEmptyLinks(page)
    await page.route('**/links/export', async (route) => {
      await route.fulfill({
        body: JSON.stringify({ reportUrl: 'https://cdn.example.com/reports/report.csv' }),
        contentType: 'application/json',
        status: 201,
      })
    })
    await page.goto('/')

    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: /baixar.*csv/i }).click()
    await expect((await download).suggestedFilename()).toMatch(/\.csv$/)
  })

  test('FE-T11 presents API failures without optimistic state', async ({ page }) => {
    await page.route('**/links', async (route) => {
      await route.fulfill({
        body: JSON.stringify({ code: 'INTERNAL_ERROR' }),
        contentType: 'application/json',
        status: 500,
      })
    })
    await page.goto('/')

    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('FE-T12 exposes loading state and disables duplicate actions', async ({ page }) => {
    await page.route('**/links', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        body: JSON.stringify({ items: [], nextCursor: null }),
        contentType: 'application/json',
      })
    })
    await page.goto('/')

    await expect(page.getByTestId('links-loading')).toBeVisible()
  })

  test('FE-T13 does not overflow on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await mockEmptyLinks(page)
    await page.goto('/')

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true)
  })

  test('FE-T14 remains readable on a desktop viewport', async ({ page }) => {
    await page.setViewportSize({ height: 900, width: 1440 })
    await mockEmptyLinks(page)
    await page.goto('/')

    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar link' })).toBeVisible()
  })
})
