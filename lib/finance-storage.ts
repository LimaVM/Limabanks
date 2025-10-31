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
  payments: TransactionPayment[] // Agora suporta múltiplas formas de pagamento
}

export interface FinanceData {
  transactions: Transaction[]
  accounts: Account[] // Adicionando contas/cartões
}

function getStorageKey(userId: string): string {
  return `finance-data-${userId}`
}

export function getFinanceData(userId: string): FinanceData {
  if (typeof window === "undefined") {
    return { transactions: [], accounts: [] }
  }

  try {
    const data = localStorage.getItem(getStorageKey(userId))
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading finance data:", error)
  }

  return { transactions: [], accounts: [] }
}

export function saveFinanceData(userId: string, data: FinanceData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(data))
  } catch (error) {
    console.error("Error saving finance data:", error)
  }
}

export function addAccount(userId: string, account: Omit<Account, "id">): Account {
  const data = getFinanceData(userId)
  const newAccount: Account = {
    ...account,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  }

  data.accounts.push(newAccount)
  saveFinanceData(userId, data)

  return newAccount
}

export function updateAccount(userId: string, id: string, updates: Partial<Account>): void {
  const data = getFinanceData(userId)
  const index = data.accounts.findIndex((a) => a.id === id)

  if (index !== -1) {
    data.accounts[index] = { ...data.accounts[index], ...updates }
    saveFinanceData(userId, data)
  }
}

export function deleteAccount(userId: string, id: string): void {
  const data = getFinanceData(userId)
  data.accounts = data.accounts.filter((a) => a.id !== id)
  saveFinanceData(userId, data)
}

export function addTransaction(userId: string, transaction: Omit<Transaction, "id">): Transaction {
  const data = getFinanceData(userId)
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  }

  data.transactions.push(newTransaction)

  newTransaction.payments.forEach((payment) => {
    const account = data.accounts.find((a) => a.id === payment.accountId)
    if (account) {
      if (transaction.type === "income") {
        account.balance += payment.amount
      } else {
        account.balance -= payment.amount
      }
    }
  })

  saveFinanceData(userId, data)

  return newTransaction
}

export function deleteTransaction(userId: string, id: string): void {
  const data = getFinanceData(userId)
  const transaction = data.transactions.find((t) => t.id === id)

  if (transaction) {
    transaction.payments.forEach((payment) => {
      const account = data.accounts.find((a) => a.id === payment.accountId)
      if (account) {
        if (transaction.type === "income") {
          account.balance -= payment.amount
        } else {
          account.balance += payment.amount
        }
      }
    })
  }

  data.transactions = data.transactions.filter((t) => t.id !== id)
  saveFinanceData(userId, data)
}

export function updateTransaction(userId: string, id: string, updates: Partial<Transaction>): void {
  const data = getFinanceData(userId)
  const index = data.transactions.findIndex((t) => t.id === id)

  if (index !== -1) {
    const oldTransaction = data.transactions[index]
    const newTransaction = { ...oldTransaction, ...updates }

    // Adjust balances if the amount or payments have changed
    oldTransaction.payments.forEach((payment) => {
      const account = data.accounts.find((a) => a.id === payment.accountId)
      if (account) {
        if (oldTransaction.type === "income") {
          account.balance -= payment.amount
        } else {
          account.balance += payment.amount
        }
      }
    })

    newTransaction.payments.forEach((payment) => {
      const account = data.accounts.find((a) => a.id === payment.accountId)
      if (account) {
        if (newTransaction.type === "income") {
          account.balance += payment.amount
        } else {
          account.balance -= payment.amount
        }
      }
    })

    data.transactions[index] = newTransaction
    saveFinanceData(userId, data)
  }
}

export function clearAllData(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(getStorageKey(userId))
}
