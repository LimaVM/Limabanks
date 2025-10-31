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
import { Download, LogOut } from "lucide-react"
import {
  getFinanceData,
  addAccount as apiAddAccount,
  deleteAccount as apiDeleteAccount,
  addTransaction as apiAddTransaction,
  deleteTransaction as apiDeleteTransaction,
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

  const handleExportData = async () => {
    if (!data || !userEmail) return

    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ])

    const autoTable = autoTableModule.default
    if (typeof autoTable !== "function") {
      console.error("Módulo de exportação em PDF não pôde ser carregado")
      alert("Não foi possível gerar o PDF no momento")
      return
    }
    const doc = new jsPDF()

    const generatedAt = new Date()
    const formattedDate = generatedAt.toLocaleString("pt-BR", {
      dateStyle: "full",
      timeStyle: "short",
    })

    const totalIncome = data.transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const totalExpense = data.transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

    doc.setFontSize(16)
    doc.text("Relatório Financeiro Completo", 14, 20)

    doc.setFontSize(11)
    doc.text(`Usuário: ${userEmail}`, 14, 30)
    doc.text(`Gerado em: ${formattedDate}`, 14, 36)
    doc.text(`Receitas totais: ${formatCurrency(totalIncome)}`, 14, 42)
    doc.text(`Despesas totais: ${formatCurrency(totalExpense)}`, 14, 48)
    doc.text(`Saldo final: ${formatCurrency(totalIncome - totalExpense)}`, 14, 54)

    autoTable(doc, {
      startY: 62,
      head: [["Contas", "Tipo", "Saldo Atual"]],
      body: data.accounts.map((account) => [
        account.name,
        account.type === "bank" ? "Banco" : "Cartão",
        formatCurrency(account.balance),
      ]),
      styles: { fontSize: 9 },
    })

    const transactionsStartY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : 70

    autoTable(doc, {
      startY: transactionsStartY,
      head: [["Data/Hora", "Tipo", "Categoria", "Descrição", "Valor", "Pagamentos"]],
      body: data.transactions.map((transaction) => {
        const payments = transaction.payments
          .map((payment) => {
            const account = data.accounts.find((acc) => acc.id === payment.accountId)
            const accountName = account ? account.name : "Conta removida"
            return `${accountName}: ${formatCurrency(payment.amount)}`
          })
          .join(" | ")

        return [
          new Date(transaction.occurredAt).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          }),
          transaction.type === "income" ? "Receita" : "Despesa",
          transaction.category,
          transaction.description || "-",
          formatCurrency(transaction.amount),
          payments || "Pagamentos não registrados",
        ]
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [16, 185, 129] },
    })

    doc.save(`relatorio-financeiro-${generatedAt.toISOString().split("T")[0]}.pdf`)
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
                Exportar PDF
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
