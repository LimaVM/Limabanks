"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreditCard, Building2, Plus, Trash2 } from "lucide-react"
import type { Account } from "@/lib/api-client"

interface AccountManagerProps {
  accounts: Account[]
  onAdd: (account: Omit<Account, "id">) => void
  onDelete: (id: string) => void
}

const ACCOUNT_COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
]

export function AccountManager({ accounts, onAdd, onDelete }: AccountManagerProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"bank" | "card">("bank")
  const [balance, setBalance] = useState("")
  const [color, setColor] = useState(ACCOUNT_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) return

    onAdd({
      name,
      type,
      balance: Number.parseFloat(balance) || 0,
      color,
    })

    setName("")
    setBalance("")
    setType("bank")
    setColor(ACCOUNT_COLORS[0])
    setOpen(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Contas e Cartões</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta/Cartão</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Nome</Label>
                  <Input
                    id="account-name"
                    placeholder="Ex: Nubank, Banco Inter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-type">Tipo</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "bank" | "card")}>
                    <SelectTrigger id="account-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Banco</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-balance">Saldo Inicial (R$)</Label>
                  <Input
                    id="account-balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex flex-wrap gap-2">
                    {ACCOUNT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Adicionar
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Adicione uma conta ou cartão para começar</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors md:flex-row md:items-center md:justify-between"
              >
                <div className="flex w-full items-center gap-3 md:w-auto">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.type === "bank" ? (
                      <Building2 className="h-5 w-5 text-white" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.type === "bank" ? "Banco" : "Cartão"}</p>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
                  <span className={`font-semibold ${account.balance >= 0 ? "text-primary" : "text-destructive"}`}>
                    {formatCurrency(account.balance)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(account.id)}
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
