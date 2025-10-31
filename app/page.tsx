"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { TransactionForm } from "@/components/transaction-form"
import { SummaryCards } from "@/components/summary-cards"
import { TransactionsList } from "@/components/transactions-list"
import { CategoryChart } from "@/components/category-chart"
import { AccountManager } from "@/components/account-manager"
import { LoginPage } from "@/components/login-page"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Download, Trash2, LogOut } from "lucide-react"
import {
  getFinanceData,
  addAccount as apiAddAccount,
  deleteAccount as apiDeleteAccount,
  addTransaction as apiAddTransaction,
  deleteTransaction as apiDeleteTransaction,
  clearAllData as apiClearAllData,
  type Transaction,
  type Account,
} from "@/lib/api-client"

export default function FinancePage() {
  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null
    }

    const savedUserId = localStorage.getItem("userId")
    const savedEmail = localStorage.getItem("userEmail")

    if (savedUserId && savedEmail) {
      return savedUserId
    }

    return null
  })
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null
    }

    const savedUserId = localStorage.getItem("userId")
    const savedEmail = localStorage.getItem("userEmail")

    if (savedUserId && savedEmail) {
      return savedEmail
    }

    return null
  })

  const { data, error, isLoading } = useSWR(
    userId ? `/api/finance/${userId}` : null,
    () => (userId ? getFinanceData(userId) : null),
    {
      refreshInterval: 1000, // Atualiza a cada 1 segundo
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  )

  const transactions = data?.transactions || []
  const accounts = data?.accounts || []

  const handleLogin = (id: string, email: string) => {
    setUserId(id)
    setUserEmail(email)
    localStorage.setItem("userId", id)
    localStorage.setItem("userEmail", email)
  }

  const handleLogout = () => {
    setUserId(null)
    setUserEmail(null)
    localStorage.removeItem("userId")
    localStorage.removeItem("userEmail")
  }

  const handleAddAccount = async (account: Omit<Account, "id">) => {
    if (!userId) return
    try {
      await apiAddAccount(userId, account)
      mutate(`/api/finance/${userId}`) // Revalidar dados
    } catch (error) {
      console.error("Error adding account:", error)
      alert("Erro ao adicionar conta")
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!userId) return
    try {
      await apiDeleteAccount(userId, id)
      mutate(`/api/finance/${userId}`) // Revalidar dados
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Erro ao deletar conta")
    }
  }

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!userId) return
    try {
      await apiAddTransaction(userId, transaction)
      mutate(`/api/finance/${userId}`) // Revalidar dados
    } catch (error) {
      console.error("Error adding transaction:", error)
      alert("Erro ao adicionar transação")
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!userId) return
    try {
      await apiDeleteTransaction(userId, id)
      mutate(`/api/finance/${userId}`) // Revalidar dados
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("Erro ao deletar transação")
    }
  }

  const handleExportData = () => {
    if (!data) return
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `financas-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = async () => {
    if (!userId) return
    if (confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")) {
      try {
        await apiClearAllData(userId)
        mutate(`/api/finance/${userId}`) // Revalidar dados
      } catch (error) {
        console.error("Error clearing data:", error)
        alert("Erro ao limpar dados")
      }
    }
  }

  if (!userId) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <ThemeToggle />
      </>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo width={180} height={54} className="mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Logo width={180} height={54} />
              <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Tudo
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <SummaryCards transactions={transactions} accounts={accounts} />

          <AccountManager accounts={accounts} onAdd={handleAddAccount} onDelete={handleDeleteAccount} />

          <div className="grid gap-8 lg:grid-cols-2">
            <TransactionForm accounts={accounts} onAdd={handleAddTransaction} />
            <CategoryChart transactions={transactions} />
          </div>

          <TransactionsList transactions={transactions} accounts={accounts} onDelete={handleDeleteTransaction} />
        </div>
      </main>

      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Dados sincronizados em tempo real • Atualização automática a cada 1 segundo</p>
          <p className="mt-2">
            Desenvolvido por <span className="font-semibold text-primary">DevLima Soluções</span>
          </p>
        </div>
      </footer>

      <ThemeToggle />
    </div>
  )
}
