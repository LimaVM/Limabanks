"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import type { Transaction, Account } from "@/lib/api-client"
import { formatBrazilDateTime } from "@/lib/timezone"

interface TransactionsListProps {
  transactions: Transaction[]
  accounts: Account[] // Para mostrar nome da conta
  onDelete: (id: string) => void
}

export function TransactionsList({ transactions, accounts, onDelete }: TransactionsListProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.name || "Conta removida"
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  })

  const getPaymentsSummary = (transaction: Transaction) => {
    if (!transaction.payments || transaction.payments.length === 0) {
      return "Pagamentos não registrados"
    }

    const details = transaction.payments
      .map((payment) => `${getAccountName(payment.accountId)} (${formatCurrency(payment.amount)})`)
      .join(" • ")

    return `Pagamentos: ${details}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nenhuma transação registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-col gap-3 flex-1 sm:flex-row sm:items-start sm:gap-3 md:items-center">
                  {transaction.type === "income" ? (
                    <ArrowUpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{transaction.category}</span>
                      <span className="text-xs text-muted-foreground">• {formatBrazilDateTime(transaction.occurredAt)}</span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{getPaymentsSummary(transaction)}</p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
                  <span
                    className={`font-semibold text-lg ${
                      transaction.type === "income" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="text-muted-foreground hover:text-destructive self-start md:self-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
