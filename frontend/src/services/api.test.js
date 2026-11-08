import { beforeAll, describe, expect, it, vi } from 'vitest'
import api, { isBackendUnavailable } from './api'

beforeAll(() => {
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {}, removeItem: () => {} })
  vi.stubGlobal('window', { location: { pathname: '/', href: '/' } })
})

const indexPage = '<!doctype html><html lang="vi"><head></head><body><div id="root"></div></body></html>'

// Answers a request the way a given host would, without any network.
const answer = (status, data, contentType) => (config) => {
  const response = { status, data, headers: { 'content-type': contentType }, config, statusText: '' }
  if (status >= 200 && status < 300) return Promise.resolve(response)
  const error = new Error(`Request failed with status code ${status}`)
  error.response = response
  error.config = config
  return Promise.reject(error)
}

const outcome = (adapter) => api.post('/api/auth/login', {}, { adapter }).then(
  (response) => ({ ok: true, response }),
  (error) => ({ ok: false, error }),
)

describe('API calls on a host without the API server', () => {
  it('treats index.html served with 200 (Node static server fallback) as no server, not as data', async () => {
    const result = await outcome(answer(200, indexPage, 'text/html; charset=utf-8'))
    expect(result.ok).toBe(false)
    expect(result.error.response).toBeUndefined()
    expect(isBackendUnavailable(result.error)).toBe(true)
  })

  it('treats the 405 page GitHub Pages returns for a POST as no server', async () => {
    const result = await outcome(answer(405, '<html><body>405 Not Allowed</body></html>', 'text/html'))
    expect(result.ok).toBe(false)
    expect(result.error.response).toBeUndefined()
    expect(isBackendUnavailable(result.error)).toBe(true)
  })

  it('treats the 503 of server.js for /api/ as no server', async () => {
    const result = await outcome(answer(503, 'API server is not part of this deployment', 'text/plain'))
    expect(isBackendUnavailable(result.error)).toBe(true)
  })

  it('keeps real API answers, including real API errors', async () => {
    const good = await outcome(answer(200, { access_token: 't' }, 'application/json'))
    expect(good.ok).toBe(true)
    expect(good.response.data.access_token).toBe('t')

    const wrongPassword = await outcome(answer(401, { detail: 'Sai mật khẩu' }, 'application/json'))
    expect(wrongPassword.error.response.status).toBe(401)
    expect(isBackendUnavailable(wrongPassword.error)).toBe(false)
  })
})
