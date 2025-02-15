"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, Plus, RefreshCcw, Search, Edit, Trash2, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

type AmazonOrder = {
  id: string
  orderNumber: string
  orderDate: string
  numberOfItems: number
  paymentMethod: string
  subtotal: number
  additionalFee: number
  shippingHandling: number
  taxCollected: number
  giftCardAmount: number
  orderTotal: number
  refundType?: string
  refundAmount?: number
}

type Payout = {
  id: string
  date: string
  amount: number
  method: string
  description?: string
}

type CombinedEntry = AmazonOrder | Payout

export default function AmazonPayoutTable() {
  const [entries, setEntries] = useState<CombinedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false)
  const [isAddPayoutDialogOpen, setIsAddPayoutDialogOpen] = useState(false)
  const [isEditOrderDialogOpen, setIsEditOrderDialogOpen] = useState(false)
  const [isEditPayoutDialogOpen, setIsEditPayoutDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<AmazonOrder | null>(null)
  const [currentPayout, setCurrentPayout] = useState<Payout | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersResponse, payoutsResponse] = await Promise.all([fetch("/api/amazon-orders"), fetch("/api/payouts")])

      if (!ordersResponse.ok || !payoutsResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const orders: AmazonOrder[] = await ordersResponse.json()
      const payouts: Payout[] = await payoutsResponse.json()

      const combinedEntries: CombinedEntry[] = [...orders, ...payouts].sort(
        (a, b) =>
          new Date("date" in b ? b.date : b.orderDate).getTime() -
          new Date("date" in a ? a.date : a.orderDate).getTime(),
      )

      setEntries(combinedEntries)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddOrder = async (formData: FormData) => {
    try {
      const orderData = Object.fromEntries(formData.entries())
      const response = await fetch("/api/amazon-orders/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error("Failed to add order")

      toast.success("Order added successfully")
      setIsAddOrderDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add order")
    }
  }

  const handleAddPayout = async (formData: FormData) => {
    try {
      const payoutData = Object.fromEntries(formData.entries())
      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutData),
      })

      if (!response.ok) throw new Error("Failed to add payout")

      toast.success("Payout added successfully")
      setIsAddPayoutDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error("Failed to add payout")
    }
  }

  const handleUpdateOrder = async (formData: FormData) => {
    if (!currentOrder) return

    try {
      const orderData = Object.fromEntries(formData.entries())
      const response = await fetch(`/api/amazon-orders/${currentOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error("Failed to update order")

      toast.success("Order updated successfully")
      setIsEditOrderDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update order")
    }
  }

  const handleUpdatePayout = async (formData: FormData) => {
    if (!currentPayout) return

    try {
      const payoutData = Object.fromEntries(formData.entries())
      const response = await fetch(`/api/payouts/${currentPayout.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payoutData),
      })

      if (!response.ok) throw new Error("Failed to update payout")

      toast.success("Payout updated successfully")
      setIsEditPayoutDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update payout")
    }
  }

  const handleDelete = async (id: string, type: "order" | "payout") => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const response = await fetch(`/api/${type === "order" ? "amazon-orders" : "payouts"}/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error(`Failed to delete ${type}`)

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`)
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error(`Failed to delete ${type}`)
    }
  }

  const filteredEntries = entries.filter((entry) => {
    const searchLower = searchTerm.toLowerCase()
    if ("orderNumber" in entry) {
      return (
        entry.orderNumber.toLowerCase().includes(searchLower) || entry.paymentMethod.toLowerCase().includes(searchLower)
      )
    } else {
      return entry.method.toLowerCase().includes(searchLower) || entry.description?.toLowerCase().includes(searchLower)
    }
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Amazon Orders and Payouts</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddOrderDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Order
            </Button>
            <Button onClick={() => setIsAddPayoutDialogOpen(true)} variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> Add Payout
            </Button>
            <Button variant="outline" onClick={fetchData}>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className={
                      "orderNumber" in entry
                        ? "bg-background hover:bg-muted/50"
                        : "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
                    }
                  >
                    <TableCell>
                      {format(new Date("orderDate" in entry ? entry.orderDate : entry.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{"orderNumber" in entry ? "Order" : "Payout"}</TableCell>
                    <TableCell>
                      {"orderNumber" in entry ? <>Order #: {entry.orderNumber}</> : <>Method: {entry.method}</>}
                    </TableCell>
                    <TableCell>
                      {"orderTotal" in entry ? `$${entry.orderTotal.toFixed(2)}` : `$${entry.amount.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              if ("orderNumber" in entry) {
                                setCurrentOrder(entry)
                                setIsEditOrderDialogOpen(true)
                              } else {
                                setCurrentPayout(entry)
                                setIsEditPayoutDialogOpen(true)
                              }
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(entry.id, "orderNumber" in entry ? "order" : "payout")}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Add Order Dialog */}
      <Dialog open={isAddOrderDialogOpen} onOpenChange={setIsAddOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAddOrder(new FormData(e.currentTarget))
            }}
          >
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input id="orderNumber" name="orderNumber" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input id="orderDate" name="orderDate" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="numberOfItems">Number of Items</Label>
                  <Input id="numberOfItems" name="numberOfItems" type="number" min="1" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input id="paymentMethod" name="paymentMethod" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subtotal">Subtotal ($)</Label>
                  <Input id="subtotal" name="subtotal" type="number" step="0.01" min="0" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="additionalFee">Additional Fee ($)</Label>
                  <Input id="additionalFee" name="additionalFee" type="number" step="0.01" min="0" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shippingHandling">Shipping & Handling ($)</Label>
                  <Input id="shippingHandling" name="shippingHandling" type="number" step="0.01" min="0" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxCollected">Tax Collected ($)</Label>
                  <Input id="taxCollected" name="taxCollected" type="number" step="0.01" min="0" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="giftCardAmount">Gift Card Amount ($)</Label>
                <Input id="giftCardAmount" name="giftCardAmount" type="number" step="0.01" min="0" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="refundType">Refund Type (Optional)</Label>
                  <Input id="refundType" name="refundType" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="refundAmount">Refund Amount ($) (Optional)</Label>
                  <Input id="refundAmount" name="refundAmount" type="number" step="0.01" min="0" />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Add Order
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Payout Dialog */}
      <Dialog open={isAddPayoutDialogOpen} onOpenChange={setIsAddPayoutDialogOpen}>
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
            <Button type="submit" className="w-full">
              Add Payout
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditOrderDialogOpen} onOpenChange={setIsEditOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          {currentOrder && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleUpdateOrder(new FormData(e.currentTarget))
              }}
            >
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-orderNumber">Order Number</Label>
                    <Input id="edit-orderNumber" name="orderNumber" defaultValue={currentOrder.orderNumber} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-orderDate">Order Date</Label>
                    <Input
                      id="edit-orderDate"
                      name="orderDate"
                      type="date"
                      defaultValue={format(new Date(currentOrder.orderDate), "yyyy-MM-dd")}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-numberOfItems">Number of Items</Label>
                    <Input
                      id="edit-numberOfItems"
                      name="numberOfItems"
                      type="number"
                      min="1"
                      defaultValue={currentOrder.numberOfItems}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                    <Input
                      id="edit-paymentMethod"
                      name="paymentMethod"
                      defaultValue={currentOrder.paymentMethod}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subtotal">Subtotal ($)</Label>
                    <Input
                      id="edit-subtotal"
                      name="subtotal"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={currentOrder.subtotal}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-additionalFee">Additional Fee ($)</Label>
                    <Input
                      id="edit-additionalFee"
                      name="additionalFee"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={currentOrder.additionalFee}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-shippingHandling">Shipping & Handling ($)</Label>
                    <Input
                      id="edit-shippingHandling"
                      name="shippingHandling"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={currentOrder.shippingHandling}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-taxCollected">Tax Collected ($)</Label>
                    <Input
                      id="edit-taxCollected"
                      name="taxCollected"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={currentOrder.taxCollected}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-giftCardAmount">Gift Card Amount ($)</Label>
                  <Input
                    id="edit-giftCardAmount"
                    name="giftCardAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={currentOrder.giftCardAmount}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-refundType">Refund Type (Optional)</Label>
                    <Input id="edit-refundType" name="refundType" defaultValue={currentOrder.refundType} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-refundAmount">Refund Amount ($) (Optional)</Label>
                    <Input
                      id="edit-refundAmount"
                      name="refundAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={currentOrder.refundAmount}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Update Order
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Payout Dialog */}
      <Dialog open={isEditPayoutDialogOpen} onOpenChange={setIsEditPayoutDialogOpen}>
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
              <Button type="submit" className="w-full">
                Update Payout
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}