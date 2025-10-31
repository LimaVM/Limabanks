"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import type { Transaction, Account } from "@/lib/finance-storage"

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

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR")
  }

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    return account?.name || "Conta removida"
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

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
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {transaction.type === "income" ? (
                    <ArrowUpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{transaction.category}</span>
                      <span className="text-xs text-muted-foreground">• {getAccountName(transaction.accountId)}</span>
                      <span className="text-xs text-muted-foreground">• {formatDate(transaction.date)}</span>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
                    className="text-muted-foreground hover:text-destructive"
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
