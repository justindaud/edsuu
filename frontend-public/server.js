const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const os = require('os')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = 5000

// Get local IP address
const getLocalIP = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return '0.0.0.0'
}

const app = next({ dev, hostname, port, dir: '.' })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
  .listen(port, hostname, (err) => {
    if (err) throw err
    const localIP = getLocalIP()
    console.clear()
    console.log(`
> Ready on:
- Local:    http://localhost:${port}
- Network:  http://${localIP}:${port}
    `)
  })
}) 