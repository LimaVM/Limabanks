"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, Wallet, CreditCard } from "lucide-react"
import type { Account } from "@/lib/api-client"

interface SummaryCardsProps {
  accounts: Account[]
}

export function SummaryCards({ accounts }: SummaryCardsProps) {
  const totalBanksBalance = accounts.filter((a) => a.type === "bank").reduce((sum, a) => sum + a.balance, 0)

  const totalCardsBalance = accounts.filter((a) => a.type === "card").reduce((sum, a) => sum + a.balance, 0)

  const totalExpenses = Math.abs(accounts.reduce((sum, a) => sum + (a.balance < 0 ? a.balance : 0), 0))

  const totalBalance = totalBanksBalance + totalCardsBalance

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Bancos</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{formatCurrency(totalBanksBalance)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total em contas bancárias</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Cartões</CardTitle>
          <CreditCard className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalCardsBalance >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(totalCardsBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total em cartões</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">Total de saídas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <Wallet className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalBalance >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Bancos + Cartões</p>
        </CardContent>
      </Card>
    </div>
  )
}
