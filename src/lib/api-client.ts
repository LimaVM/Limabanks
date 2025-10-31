// Cliente para fazer chamadas às APIs com tipos

export interface User {
  id: string
  email: string
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

// Auth APIs
export async function registerUser(email: string, password: string) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Erro ao registrar")
  }

  return res.json()
}

export async function loginUser(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Erro ao fazer login")
  }

  return res.json()
}

// Finance APIs
export async function getFinanceData(userId: string): Promise<FinanceData> {
  const res = await fetch(`/api/finance/${userId}`, { cache: "no-store" })

  if (!res.ok) {
    throw new Error("Erro ao buscar dados financeiros")
  }

  return res.json()
}

export async function addAccount(userId: string, account: Omit<Account, "id">) {
  const res = await fetch(`/api/accounts/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Erro ao adicionar conta")
  }

  return res.json()
}

export async function deleteAccount(userId: string, accountId: string) {
  const res = await fetch(`/api/accounts/${userId}?id=${accountId}`, {
    method: "DELETE",
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Erro ao deletar conta")
  }

  return res.json()
}

export async function addTransaction(userId: string, transaction: Omit<Transaction, "id">) {
  const res = await fetch(`/api/transactions/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Erro ao adicionar transação")
  }

  return res.json()
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const res = await fetch(`/api/transactions/${userId}?id=${transactionId}`, {
    method: "DELETE",
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Erro ao deletar transação")
  }

  return res.json()
}
