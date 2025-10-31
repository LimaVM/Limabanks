import { NextResponse } from "next/server"
import { readJSON, writeJSON, type FinanceData, type Transaction, type TransactionPayment } from "@/lib/server-storage"

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const transactionData = await request.json()

    if (!transactionData?.occurredAt || !transactionData?.payments || !Array.isArray(transactionData.payments)) {
      return NextResponse.json({ error: "Dados da transação inválidos" }, { status: 400 })
    }

    const normalizedPayments: TransactionPayment[] = transactionData.payments
      .map((payment: TransactionPayment) => ({
        accountId: payment.accountId,
        amount: Number(payment.amount) || 0,
      }))
      .filter((payment) => payment.accountId && payment.amount > 0)

    if (normalizedPayments.length === 0) {
      return NextResponse.json({ error: "Pelo menos uma forma de pagamento é necessária" }, { status: 400 })
    }

    const data = readJSON<FinanceData>(`finance-${userId}.json`, {
      transactions: [],
      accounts: [],
    })

    const totalPayments = normalizedPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalAmount = Number(transactionData.amount) || 0

    if (Math.abs(totalPayments - totalAmount) > 0.01) {
      return NextResponse.json(
        { error: "A soma das formas de pagamento deve ser igual ao valor total" },
        { status: 400 },
      )
    }

    const newTransaction: Transaction = {
      ...transactionData,
      amount: totalAmount,
      payments: normalizedPayments,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    data.transactions.push(newTransaction)

    newTransaction.payments.forEach((payment) => {
      const account = data.accounts.find((a) => a.id === payment.accountId)
      if (account) {
        if (transactionData.type === "income") {
          account.balance += payment.amount
        } else {
          account.balance -= payment.amount
        }
      }
    })

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

    const transactionIndex = data.transactions.findIndex((t) => t.id === transactionId)

    if (transactionIndex === -1) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    const [transaction] = data.transactions.splice(transactionIndex, 1)

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
    writeJSON(`finance-${userId}.json`, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete transaction error:", error)
    return NextResponse.json({ error: "Erro ao deletar transação" }, { status: 500 })
  }
}
