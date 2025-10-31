import { NextResponse } from "next/server"
import { readJSON, writeJSON, type User, type AuthData } from "@/lib/server-storage"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const authData = readJSON<AuthData>("auth.json", { users: [] })

    // Verificar se o email já existe
    if (authData.users.find((u) => u.email === email)) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 })
    }

    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email,
      password, // Em produção, use hash de senha!
      createdAt: new Date().toISOString(),
    }

    authData.users.push(newUser)
    writeJSON("auth.json", authData)

    return NextResponse.json({ success: true, userId: newUser.id })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Erro ao registrar usuário" }, { status: 500 })
  }
}
