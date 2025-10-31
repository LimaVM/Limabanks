import { NextResponse } from "next/server"
import { readJSON, writeJSON, type FinanceData, type Account } from "@/lib/server-storage"

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const accountData = await request.json()

    const data = readJSON<FinanceData>(`finance-${userId}.json`, {
      transactions: [],
      accounts: [],
    })

    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    data.accounts.push(newAccount)
    writeJSON(`finance-${userId}.json`, data)

    return NextResponse.json({ success: true, account: newAccount })
  } catch (error) {
    console.error("Add account error:", error)
    return NextResponse.json({ error: "Erro ao adicionar conta" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get("id")

    if (!accountId) {
      return NextResponse.json({ error: "ID da conta é obrigatório" }, { status: 400 })
    }

    const data = readJSON<FinanceData>(`finance-${userId}.json`, {
      transactions: [],
      accounts: [],
    })

    data.accounts = data.accounts.filter((a) => a.id !== accountId)
    writeJSON(`finance-${userId}.json`, data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ error: "Erro ao deletar conta" }, { status: 500 })
  }
}
