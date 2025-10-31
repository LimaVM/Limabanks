"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Plus, Trash2 } from "lucide-react"
import type { Account, TransactionPayment } from "@/lib/api-client"
import { getCurrentBrazilDateTimeLocal, toBrazilISOString } from "@/lib/timezone"

interface TransactionFormProps {
  accounts: Account[]
  onAdd: (transaction: {
    type: "income" | "expense"
    amount: number
    category: string
    description: string
    occurredAt: string
    payments: TransactionPayment[] // Suporte para múltiplas formas de pagamento
  }) => void
}

const INCOME_CATEGORIES = ["Salário", "Freelance", "Investimentos", "Outros"]
const EXPENSE_CATEGORIES = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Compras", "Outros"]

export function TransactionForm({ accounts, onAdd }: TransactionFormProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [occurredAt, setOccurredAt] = useState(() => getCurrentBrazilDateTimeLocal())

  const [payments, setPayments] = useState<TransactionPayment[]>([{ accountId: "", amount: 0 }])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    const validPayments = payments.filter((p) => p.accountId && p.amount > 0)
    if (validPayments.length === 0) {
      alert("Selecione pelo menos uma conta/cartão para a transação")
      return
    }

    const totalPayments = validPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalAmount = Number.parseFloat(amount)

    if (Math.abs(totalPayments - totalAmount) > 0.01) {
      alert(
        `A soma dos pagamentos (R$ ${totalPayments.toFixed(2)}) deve ser igual ao valor total (R$ ${totalAmount.toFixed(2)})`,
      )
      return
    }

    const occurredAtIso = toBrazilISOString(occurredAt)

    if (!occurredAtIso) {
      alert("Data e hora inválidas")
      return
    }

    onAdd({
      type,
      amount: totalAmount,
      category,
      description,
      occurredAt: occurredAtIso,
      payments: validPayments,
    })

    // Reset form
    setAmount("")
    setCategory("")
    setDescription("")
    setOccurredAt(getCurrentBrazilDateTimeLocal())
    setPayments([{ accountId: "", amount: 0 }])
  }

  const addPayment = () => {
    setPayments([...payments, { accountId: "", amount: 0 }])
  }

  const removePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(payments.filter((_, i) => i !== index))
    }
  }

  const updatePayment = (index: number, field: keyof TransactionPayment, value: string | number) => {
    const newPayments = [...payments]
    newPayments[index] = { ...newPayments[index], [field]: value }
    setPayments(newPayments)
  }

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Nova Transação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor Total (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Formas de Pagamento *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addPayment}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {payments.map((payment, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Select value={payment.accountId} onValueChange={(v) => updatePayment(index, "accountId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione conta/cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.type === "bank" ? "Banco" : "Cartão"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32 space-y-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={payment.amount || ""}
                    onChange={(e) => updatePayment(index, "amount", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                {payments.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da transação"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime">Data e hora</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={accounts.length === 0}>
            {accounts.length === 0 ? "Adicione uma conta primeiro" : "Adicionar Transação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
