import { NextResponse } from "next/server"
import { readJSON, writeJSON, type FinanceData, type Transaction } from "@/lib/server-storage"

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const transactionData = await request.json()

    const data = readJSON<FinanceData>(`finance-${userId}.json`, {
      transactions: [],
      accounts: [],
    })

    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    data.transactions.push(newTransaction)

    // Atualizar saldo da conta
    const account = data.accounts.find((a) => a.id === transactionData.accountId)
    if (account) {
      if (transactionData.type === "income") {
        account.balance += transactionData.amount
      } else {
        account.balance -= transactionData.amount
      }
    }

    writeJSON(`finance-${userId}.json`, data)

    return NextResponse.json({ success: true, transaction: newTransaction })
  } catch (error) {
    console.error("Add transaction error:", error)
    return NextResponse.json({ error: "Erro ao adicionar transação" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("id")

    if (!transactionId) {
      return NextResponse.json({ error: "ID da transação é obrigatório" }, { status: 400 })
    }

    const data = readJSON<FinanceData>(`finance-${userId}.json`, {
      transactions: [],
      accounts: [],
    })

    const transaction = data.transactions.find((t) => t.id === transactionId)

    if (transaction) {
      // Reverter saldo da conta
      const account = data.accounts.find((a) => a.id === transaction.accountId)
      if (account) {
        if (transaction.type === "income") {
          account.balance -= transaction.amount
        } else {
          account.balance += transaction.amount
        }
      }
    }

    data.transactions = data.transactions.filter((t) => t.id !== transactionId)
    writeJSON(`finance-${userId}.json`, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete transaction error:", error)
    return NextResponse.json({ error: "Erro ao deletar transação" }, { status: 500 })
  }
}
