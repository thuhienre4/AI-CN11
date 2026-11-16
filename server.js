const fs = require('fs')
const http = require('http')
const path = require('path')
const zlib = require('zlib')

const root = path.join(__dirname, 'dist')
const port = Number(process.env.PORT || 8080)

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
}

// Text files are sent compressed. Built assets never change under one name, so each is compressed once
// and kept; index.html is small and compressed on every request because it must never be stale.
const compressible = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt', '.webmanifest'])
const compressed = new Map()

const pickEncoding = (req) => {
  const accepted = String(req.headers['accept-encoding'] || '')
  if (/\bbr\b/.test(accepted)) return 'br'
  if (/\bgzip\b/.test(accepted)) return 'gzip'
  return null
}

const compress = (buffer, encoding) =>
  encoding === 'br'
    ? zlib.brotliCompressSync(buffer, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } })
    : zlib.gzipSync(buffer, { level: 9 })

const sendFile = (req, res, filePath, statusCode = 200) => {
  const ext = path.extname(filePath)
  const isHtml = ext === '.html'
  const headers = {
    'Content-Type': types[ext] || 'application/octet-stream',
    'Cache-Control': isHtml
      ? 'no-store, no-cache, must-revalidate, proxy-revalidate'
      : 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  }
  const encoding = compressible.has(ext) ? pickEncoding(req) : null
  if (!encoding) {
    res.writeHead(statusCode, headers)
    fs.createReadStream(filePath).pipe(res)
    return
  }

  headers.Vary = 'Accept-Encoding'
  const key = `${encoding}:${filePath}`
  const send = (body) => {
    res.writeHead(statusCode, { ...headers, 'Content-Encoding': encoding, 'Content-Length': body.length })
    res.end(req.method === 'HEAD' ? undefined : body)
  }
  if (compressed.has(key)) {
    send(compressed.get(key))
    return
  }
  fs.readFile(filePath, (error, buffer) => {
    if (error) {
      res.writeHead(500)
      res.end()
      return
    }
    const body = compress(buffer, encoding)
    if (!isHtml) compressed.set(key, body)
    send(body)
  })
}

const server = http.createServer((req, res) => {
  let urlPath
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  } catch {
    res.writeHead(400)
    res.end()
    return
  }
  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
  const candidate = path.join(root, safePath)

  if (!candidate.startsWith(root)) {
    sendFile(req, res, path.join(root, 'index.html'))
    return
  }

  fs.stat(candidate, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(req, res, candidate)
      return
    }

    // This server holds only the built app: an API call must not get index.html as if it were data
    if (urlPath.startsWith('/api/')) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end('API server is not part of this deployment')
      return
    }

    // A missing file of an old deployment must fail as such, not arrive as an HTML page
    if (urlPath.startsWith('/assets/')) {
      res.writeHead(404, { 'Cache-Control': 'no-store' })
      res.end()
      return
    }

    sendFile(req, res, path.join(root, 'index.html'))
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Static app listening on ${port}`)
})
