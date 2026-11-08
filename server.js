const fs = require('fs')
const http = require('http')
const path = require('path')

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

const sendFile = (res, filePath, statusCode = 200) => {
  const ext = path.extname(filePath)
  const isHtml = ext === '.html'

  res.writeHead(statusCode, {
    'Content-Type': types[ext] || 'application/octet-stream',
    'Cache-Control': isHtml
      ? 'no-store, no-cache, must-revalidate, proxy-revalidate'
      : 'public, max-age=31536000, immutable',
  })

  fs.createReadStream(filePath).pipe(res)
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
    sendFile(res, path.join(root, 'index.html'))
    return
  }

  fs.stat(candidate, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, candidate)
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

    sendFile(res, path.join(root, 'index.html'))
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Static app listening on ${port}`)
})
