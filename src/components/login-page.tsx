"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { registerUser, loginUser } from "@/lib/api-client"
import { Logo } from "@/components/logo"

interface LoginPageProps {
  onLogin: (userId: string, email: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!email || !password) {
      setError("Preencha todos os campos")
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const result = await loginUser(email, password)
        if (result.success) {
          onLogin(result.userId, result.email)
        }
      } else {
        const result = await registerUser(email, password)
        if (result.success) {
          // Fazer login automaticamente após registro
          const loginResult = await loginUser(email, password)
          if (loginResult.success) {
            onLogin(loginResult.userId, loginResult.email)
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar requisição"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo width={200} height={60} />
          </div>
          <CardTitle className="text-2xl">{isLogin ? "Entrar" : "Criar Conta"}</CardTitle>
          <CardDescription>{isLogin ? "Entre com suas credenciais" : "Crie sua conta gratuitamente"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
                disabled={loading}
              >
                {isLogin ? "Não tem conta? Criar conta grátis" : "Já tem conta? Entrar"}
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Desenvolvido por <span className="font-semibold text-primary">DevLima Soluções</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
