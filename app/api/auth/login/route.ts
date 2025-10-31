import { NextResponse } from "next/server"
import { readJSON, type AuthData } from "@/lib/server-storage"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const authData = readJSON<AuthData>("auth.json", { users: [] })

    const user = authData.users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 })
    }

    return NextResponse.json({ success: true, userId: user.id, email: user.email })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
