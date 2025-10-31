export interface User {
  id: string
  email: string
  password: string
  createdAt: string
}

export interface AuthData {
  users: User[]
  currentUserId: string | null
}

const AUTH_KEY = "finance-auth-data"

export function getAuthData(): AuthData {
  if (typeof window === "undefined") {
    return { users: [], currentUserId: null }
  }

  try {
    const data = localStorage.getItem(AUTH_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading auth data:", error)
  }

  return { users: [], currentUserId: null }
}

export function saveAuthData(data: AuthData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Error saving auth data:", error)
  }
}

export function registerUser(email: string, password: string): { success: boolean; error?: string } {
  const authData = getAuthData()

  // Verificar se o email já existe
  if (authData.users.find((u) => u.email === email)) {
    return { success: false, error: "Email já cadastrado" }
  }

  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    email,
    password, // Em produção, use hash de senha!
    createdAt: new Date().toISOString(),
  }

  authData.users.push(newUser)
  saveAuthData(authData)

  return { success: true }
}

export function loginUser(email: string, password: string): { success: boolean; error?: string; userId?: string } {
  const authData = getAuthData()

  const user = authData.users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return { success: false, error: "Email ou senha incorretos" }
  }

  authData.currentUserId = user.id
  saveAuthData(authData)

  return { success: true, userId: user.id }
}

export function logoutUser(): void {
  const authData = getAuthData()
  authData.currentUserId = null
  saveAuthData(authData)
}

export function getCurrentUser(): User | null {
  const authData = getAuthData()
  if (!authData.currentUserId) return null

  return authData.users.find((u) => u.id === authData.currentUserId) || null
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
