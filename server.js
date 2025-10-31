import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import express from "express"
import compression from "compression"
import helmet from "helmet"
import morgan from "morgan"
import { createServer as createHttpServer } from "http"
import { createServer as createHttpsServer } from "https"
import { ensureDataDir, readJSON, writeJSON } from "./server/storage.js"
import {
  BRAZIL_TIMEZONE,
  getCurrentBrazilDateTimeLocal,
  toBrazilISOString,
} from "./server/timezone.js"

process.env.TZ = BRAZIL_TIMEZONE

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, "dist")
const indexFile = path.join(distDir, "index.html")

const app = express()

app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan("combined"))

ensureDataDir()

function loadFinanceData(userId) {
  return readJSON(`finance-${userId}.json`, {
    transactions: [],
    accounts: [],
  })
}

function saveFinanceData(userId, data) {
  writeJSON(`finance-${userId}.json`, data)
}

app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password } = req.body ?? {}

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" })
    }

    const authData = readJSON("auth.json", { users: [] })

    if (authData.users.find((user) => user.email === email)) {
      return res.status(400).json({ error: "Email já cadastrado" })
    }

    const nowLocal = getCurrentBrazilDateTimeLocal()
    const createdAt = toBrazilISOString(nowLocal) ?? new Date().toISOString()

    const newUser = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
      email,
      password,
      createdAt,
    }

    authData.users.push(newUser)
    writeJSON("auth.json", authData)

    return res.json({ success: true, userId: newUser.id })
  } catch (error) {
    console.error("Register error:", error)
    return res.status(500).json({ error: "Erro ao registrar usuário" })
  }
})

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body ?? {}

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" })
    }

    const authData = readJSON("auth.json", { users: [] })
    const user = authData.users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos" })
    }

    return res.json({ success: true, userId: user.id, email: user.email })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ error: "Erro ao fazer login" })
  }
})

app.get("/api/finance/:userId", (req, res) => {
  try {
    const { userId } = req.params
    const data = loadFinanceData(userId)
    return res.json(data)
  } catch (error) {
    console.error("Get finance data error:", error)
    return res.status(500).json({ error: "Erro ao buscar dados" })
  }
})

app.post("/api/finance/:userId", (req, res) => {
  try {
    const { userId } = req.params
    const updates = req.body ?? {}

    const currentData = loadFinanceData(userId)
    const newData = { ...currentData, ...updates }
    saveFinanceData(userId, newData)

    return res.json({ success: true, data: newData })
  } catch (error) {
    console.error("Update finance data error:", error)
    return res.status(500).json({ error: "Erro ao atualizar dados" })
  }
})

app.post("/api/accounts/:userId", (req, res) => {
  try {
    const { userId } = req.params
    const accountData = req.body ?? {}

    if (!accountData?.name || !accountData?.type) {
      return res.status(400).json({ error: "Dados da conta inválidos" })
    }

    const data = loadFinanceData(userId)

    const newAccount = {
      ...accountData,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
      balance: Number(accountData.balance ?? 0),
    }

    data.accounts.push(newAccount)
    saveFinanceData(userId, data)

    return res.json({ success: true, account: newAccount })
  } catch (error) {
    console.error("Add account error:", error)
    return res.status(500).json({ error: "Erro ao adicionar conta" })
  }
})

app.delete("/api/accounts/:userId", (req, res) => {
  try {
    const { userId } = req.params
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: "ID da conta é obrigatório" })
    }

    const data = loadFinanceData(userId)
    data.accounts = data.accounts.filter((account) => account.id !== id)
    saveFinanceData(userId, data)

    return res.json({ success: true })
  } catch (error) {
    console.error("Delete account error:", error)
    return res.status(500).json({ error: "Erro ao deletar conta" })
  }
})

app.post("/api/transactions/:userId", (req, res) => {
  try {
    const { userId } = req.params
    const transactionData = req.body ?? {}

    if (!transactionData?.occurredAt || !Array.isArray(transactionData?.payments)) {
      return res.status(400).json({ error: "Dados da transação inválidos" })
    }

    const normalizedPayments = transactionData.payments
      .map((payment) => ({
        accountId: payment.accountId,
        amount: Number(payment.amount) || 0,
      }))
      .filter((payment) => payment.accountId && payment.amount > 0)

    if (normalizedPayments.length === 0) {
      return res.status(400).json({ error: "Pelo menos uma forma de pagamento é necessária" })
    }

    const totalPayments = normalizedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalAmount = Number(transactionData.amount) || 0

    if (Math.abs(totalPayments - totalAmount) > 0.01) {
      return res.status(400).json({ error: "A soma das formas de pagamento deve ser igual ao valor total" })
    }

    const occurredAtInput = String(transactionData.occurredAt)
    let occurredAtIso = null

    if (occurredAtInput.endsWith("Z") || occurredAtInput.includes("+")) {
      const occurredAtDate = new Date(occurredAtInput)
      if (!Number.isNaN(occurredAtDate.getTime())) {
        occurredAtIso = occurredAtDate.toISOString()
      }
    } else {
      occurredAtIso = toBrazilISOString(occurredAtInput)
    }

    if (!occurredAtIso) {
      return res.status(400).json({ error: "Data da transação inválida" })
    }

    const data = loadFinanceData(userId)

    const newTransaction = {
      ...transactionData,
      amount: totalAmount,
      payments: normalizedPayments,
      occurredAt: occurredAtIso,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    }

    data.transactions.push(newTransaction)

    newTransaction.payments.forEach((payment) => {
      const account = data.accounts.find((acc) => acc.id === payment.accountId)
      if (account) {
        if (transactionData.type === "income") {
          account.balance += payment.amount
        } else {
          account.balance -= payment.amount
        }
      }
    })

    saveFinanceData(userId, data)

    return res.json({ success: true, transaction: newTransaction })
  } catch (error) {
    console.error("Add transaction error:", error)
    return res.status(500).json({ error: "Erro ao adicionar transação" })
  }
})

app.delete("/api/transactions/:userId", (req, res) => {
  try {
    const { userId } = req.params
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: "ID da transação é obrigatório" })
    }

    const data = loadFinanceData(userId)
    const transactionIndex = data.transactions.findIndex((transaction) => transaction.id === id)

    if (transactionIndex === -1) {
      return res.status(404).json({ error: "Transação não encontrada" })
    }

    const [transaction] = data.transactions.splice(transactionIndex, 1)

    transaction.payments.forEach((payment) => {
      const account = data.accounts.find((acc) => acc.id === payment.accountId)
      if (account) {
        if (transaction.type === "income") {
          account.balance -= payment.amount
        } else {
          account.balance += payment.amount
        }
      }
    })

    saveFinanceData(userId, data)

    return res.json({ success: true })
  } catch (error) {
    console.error("Delete transaction error:", error)
    return res.status(500).json({ error: "Erro ao deletar transação" })
  }
})

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: "1y", index: false }))
}

app.get("*", (req, res) => {
  if (!fs.existsSync(indexFile)) {
    return res.status(503).send("Aplicação ainda não foi compilada")
  }

  return res.sendFile(indexFile)
})

const hostname = "0.0.0.0"
const httpPort = Number(process.env.HTTP_PORT ?? process.env.PORT ?? 80)
const httpsPort = Number(process.env.HTTPS_PORT ?? 443)

createHttpServer(app).listen(httpPort, hostname, () => {
  console.log(`Servidor HTTP ouvindo em http://${hostname}:${httpPort}`)
})

const certPath = process.env.HTTPS_CERT_PATH ?? "/etc/letsencrypt/live/con.devlima.wtf/fullchain.pem"
const keyPath = process.env.HTTPS_KEY_PATH ?? "/etc/letsencrypt/live/con.devlima.wtf/privkey.pem"

try {
  const credentials = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  }

  createHttpsServer(credentials, app).listen(httpsPort, hostname, () => {
    console.log(`Servidor HTTPS ouvindo em https://${hostname}:${httpsPort}`)
  })
} catch (error) {
  console.warn(
    "Certificados HTTPS não encontrados. Inicie com as variáveis HTTPS_CERT_PATH e HTTPS_KEY_PATH para habilitar a porta 443.",
  )
}
