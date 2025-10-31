const { createServer } = require("http")
const { createServer: createHttpsServer } = require("https")
const { parse } = require("url")
const next = require("next")
const fs = require("fs")
const path = require("path")

const dev = process.env.NODE_ENV !== "production"
const hostname = "con.devlima.wtf"
const httpPort = 80
const httpsPort = 443

// Caminhos dos certificados SSL
const certPath = "/etc/letsencrypt/live/con.devlima.wtf"
const sslOptions = {
  key: fs.readFileSync(path.join(certPath, "privkey.pem")),
  cert: fs.readFileSync(path.join(certPath, "fullchain.pem")),
}

// Inicializar Next.js
const app = next({ dev, hostname, port: httpsPort })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Servidor HTTPS (porta 443)
  createHttpsServer(sslOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  }).listen(httpsPort, (err) => {
    if (err) throw err
    console.log(`> HTTPS Server ready on https://${hostname}:${httpsPort}`)
  })

  // Servidor HTTP (porta 80) - Redireciona para HTTPS
  createServer((req, res) => {
    const host = req.headers.host || hostname
    const redirectUrl = `https://${host}${req.url}`

    res.writeHead(301, { Location: redirectUrl })
    res.end()
  }).listen(httpPort, (err) => {
    if (err) throw err
    console.log(`> HTTP Server ready on http://${hostname}:${httpPort} (redirecting to HTTPS)`)
  })
})

// Tratamento de erros
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
})
