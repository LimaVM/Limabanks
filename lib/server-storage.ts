import fs from "fs"
import path from "path"

const DATA_DIR = "/home/ubuntu/BANCO_DATA"

// Garantir que o diretório existe
export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Ler arquivo JSON
export function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
  }

  return defaultValue
}

// Escrever arquivo JSON
export function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8")
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    throw error
  }
}

// Tipos
export interface User {
  id: string
  email: string
  password: string
  createdAt: string
}

export interface AuthData {
  users: User[]
}

export interface Account {
  id: string
  name: string
  type: "bank" | "card"
  balance: number
  color: string
}

export interface TransactionPayment {
  accountId: string
  amount: number
}

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  occurredAt: string
  payments: TransactionPayment[]
}

export interface FinanceData {
  transactions: Transaction[]
  accounts: Account[]
}
