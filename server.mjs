import fs from "fs"
import { createServer as createHttpServer } from "http"
import { createServer as createHttpsServer } from "https"
import next from "next"

process.env.TZ = "America/Sao_Paulo"

const dev = process.env.NODE_ENV !== "production"
const hostname = "0.0.0.0"
const httpPort = Number(process.env.HTTP_PORT ?? process.env.PORT ?? 80)
const httpsPort = Number(process.env.HTTPS_PORT ?? 443)

const app = next({ dev, hostname, port: httpPort })
const handle = app.getRequestHandler()

await app.prepare()

async function handleRequest(req, res) {
  try {
    await handle(req, res)
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    res.statusCode = 500
    res.end("Internal Server Error")
  }
}

createHttpServer((req, res) => {
  void handleRequest(req, res)
}).listen(httpPort, hostname, () => {
  console.log(`Servidor HTTP ouvindo em http://${hostname}:${httpPort}`)
})

const certPath = process.env.HTTPS_CERT_PATH ?? "/etc/letsencrypt/live/con.devlima.wtf/fullchain.pem"
const keyPath = process.env.HTTPS_KEY_PATH ?? "/etc/letsencrypt/live/con.devlima.wtf/privkey.pem"

try {
  const credentials = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  }

  createHttpsServer(credentials, (req, res) => {
    void handleRequest(req, res)
  }).listen(httpsPort, hostname, () => {
    console.log(`Servidor HTTPS ouvindo em https://${hostname}:${httpsPort}`)
  })
} catch (error) {
  console.warn(
    "Certificados HTTPS não encontrados. Inicie com as variáveis HTTPS_CERT_PATH e HTTPS_KEY_PATH para habilitar a porta 443.",
  )
}
