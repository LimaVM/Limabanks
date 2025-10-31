import { NextResponse } from "next/server"
import { readJSON, writeJSON, type FinanceData } from "@/lib/server-storage"

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params

    const data = readJSON<FinanceData>(`finance-${userId}.json`, {
      transactions: [],
      accounts: [],
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Get finance data error:", error)
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params
    const updates = await request.json()

    const currentData = readJSON<FinanceData>(`finance-${userId}.json`, {
      transactions: [],
      accounts: [],
    })

    const newData = { ...currentData, ...updates }
    writeJSON(`finance-${userId}.json`, newData)

    return NextResponse.json({ success: true, data: newData })
  } catch (error) {
    console.error("Update finance data error:", error)
    return NextResponse.json({ error: "Erro ao atualizar dados" }, { status: 500 })
  }
}
