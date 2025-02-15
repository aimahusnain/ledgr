"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, RefreshCcw, Search, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

type Payout = {
  id: string
  date: string
  amount: number
  method: string
  description?: string
}

export default function PayoutsTable() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPayout, setCurrentPayout] = useState<Payout | null>(null)

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/payouts")
      if (!response.ok) throw new Error("Failed to fetch payouts")
      const data = await response.json()
      setPayouts(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch payouts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [])

  const handleAddPayout = async (formData: FormData) => {
    try {
      const payoutData: any = {}
      formData.forEach((value, key) => {
        payoutData[key] = value
      })

      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add payout")
      }

      toast.success("Payout added successfully")
      setIsAddDialogOpen(false)
      fetchPayouts()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to add payout")
    }
  }

  const handleUpdatePayout = async (formData: FormData) => {
    if (!currentPayout) return

    try {
      const payoutData: any = {}
      formData.forEach((value, key) => {
        payoutData[key] = value
      })

      const response = await fetch(`/api/payouts/${currentPayout.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update payout")
      }

      toast.success("Payout updated successfully")
      setIsEditDialogOpen(false)
      fetchPayouts()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to update payout")
    }
  }

  const handleDeletePayout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payout?")) return

    try {
      const response = await fetch(`/api/payouts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete payout")
      }

      toast.success("Payout deleted successfully")
      fetchPayouts()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to delete payout")
    }
  }

  const filteredPayouts = payouts.filter(
    (payout) =>
      format(new Date(payout.date), "dd MMM yyyy").toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.amount.toString().includes(searchTerm) ||
      payout.method.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Payouts</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payouts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="dark:text-black">
                  <Plus className="mr-2 h-4 w-4" /> Add Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Payout</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddPayout(new FormData(e.currentTarget))
                  }}
                >
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input id="date" name="date" type="date" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input id="amount" name="amount" type="number" step="0.01" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="method" className="text-right">
                        Method
                      </Label>
                      <Input id="method" name="method" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input id="description" name="description" className="col-span-3" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Add Payout</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={fetchPayouts}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{format(new Date(payout.date), "dd MMM yyyy")}</TableCell>
                  <TableCell>${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>{payout.method}</TableCell>
                  <TableCell>{payout.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setCurrentPayout(payout)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeletePayout(payout.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payout</DialogTitle>
          </DialogHeader>
          {currentPayout && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdatePayout(new FormData(e.currentTarget))
              }}
            >
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    className="col-span-3"
                    defaultValue={format(new Date(currentPayout.date), "yyyy-MM-dd")}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    defaultValue={currentPayout.amount}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-method" className="text-right">
                    Method
                  </Label>
                  <Input
                    id="edit-method"
                    name="method"
                    className="col-span-3"
                    defaultValue={currentPayout.method}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="edit-description"
                    name="description"
                    className="col-span-3"
                    defaultValue={currentPayout.description}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Update Payout</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

