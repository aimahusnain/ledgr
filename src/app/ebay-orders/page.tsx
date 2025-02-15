"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, RefreshCcw, Trash2, Pencil, RotateCcw } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type EbayOrder = {
  id: string
  orderNumber: string
  orderDate: string
  orderQuantity: number
  itemSubtotal: number
  shippingHandling: number
  taxCollected: number
  transactionFee: number
  adFees: number
  netAmount: number
  totalAmount: number
  remainingAmount: number
  isPaid: boolean
}

export default function EbayOrdersPage() {
  const [orders, setOrders] = useState<EbayOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<EbayOrder | null>(null)
  const [formData, setFormData] = useState({
    orderNumber: "",
    orderDate: "",
    orderQuantity: "",
    itemSubtotal: "",
    shippingHandling: "",
    taxCollected: "",
    transactionFee: "",
    adFees: "",
  })
  const [refundData, setRefundData] = useState({
    amount: "",
    type: "",
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/ebay-orders")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch orders")
      }
      const data = await response.json()
      setOrders(data.orders)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to fetch orders: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const endpoint = selectedOrder ? `/api/ebay-orders/${selectedOrder.id}` : "/api/ebay-orders"
      const method = selectedOrder ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${selectedOrder ? "update" : "add"} order`)
      }

      toast.success(`Order ${selectedOrder ? "updated" : "added"} successfully`)
      setIsAddDialogOpen(false)
      // setIsEditDialogOpen(false)
      setFormData({
        orderNumber: "",
        orderDate: "",
        orderQuantity: "",
        itemSubtotal: "",
        shippingHandling: "",
        taxCollected: "",
        transactionFee: "",
        adFees: "",
      })
      fetchOrders()
    } catch (error) {
      console.error(`Failed to ${selectedOrder ? "update" : "add"} order:`, error)
      toast.error(
        `Failed to ${selectedOrder ? "update" : "add"} order: ` +
          (error instanceof Error ? error.message : "Unknown error"),
      )
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return

    try {
      const response = await fetch(`/api/ebay-orders/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete order")
      }
      toast.success("Order deleted successfully")
      fetchOrders()
    } catch (error) {
      console.error("Failed to delete order:", error)
      toast.error("Failed to delete order: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    try {
      const response = await fetch(`/api/ebay-orders/${selectedOrder.id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refundData),
      })

      if (response.ok) {
        toast.success("Refund processed successfully")
        setIsRefundDialogOpen(false)
        setRefundData({
          amount: "",
          type: "",
        })
        fetchOrders()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Failed to process refund")
      }
    } catch (error) {
      console.error("Failed to process refund:", error)
      toast.error("Failed to process refund: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  return (
    <div className="flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">eBay Orders</h1>
          <p className="text-muted-foreground">Manage your eBay orders and track their details</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New eBay Order</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    type="date"
                    id="orderDate"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="orderQuantity">Order Quantity</Label>
                  <Input
                    type="number"
                    id="orderQuantity"
                    value={formData.orderQuantity}
                    onChange={(e) => setFormData({ ...formData, orderQuantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="itemSubtotal">Item Subtotal</Label>
                  <Input
                    type="number"
                    id="itemSubtotal"
                    value={formData.itemSubtotal}
                    onChange={(e) => setFormData({ ...formData, itemSubtotal: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="shippingHandling">Shipping and Handling</Label>
                  <Input
                    type="number"
                    id="shippingHandling"
                    value={formData.shippingHandling}
                    onChange={(e) => setFormData({ ...formData, shippingHandling: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="taxCollected">eBay Collected Tax</Label>
                  <Input
                    type="number"
                    id="taxCollected"
                    value={formData.taxCollected}
                    onChange={(e) => setFormData({ ...formData, taxCollected: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionFee">Transaction Fee</Label>
                  <Input
                    type="number"
                    id="transactionFee"
                    value={formData.transactionFee}
                    onChange={(e) => setFormData({ ...formData, transactionFee: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="adFees">Ad Fees</Label>
                  <Input
                    type="number"
                    id="adFees"
                    value={formData.adFees}
                    onChange={(e) => setFormData({ ...formData, adFees: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <Button type="submit" className="col-span-2">
                  {selectedOrder ? "Update Order" : "Add Order"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={fetchOrders}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-background">Order Number</TableHead>
                    <TableHead className="sticky top-0 bg-background">Date</TableHead>
                    <TableHead className="sticky top-0 bg-background">Quantity</TableHead>
                    <TableHead className="sticky top-0 bg-background">Subtotal</TableHead>
                    <TableHead className="sticky top-0 bg-background">Shipping</TableHead>
                    <TableHead className="sticky top-0 bg-background">Tax</TableHead>
                    <TableHead className="sticky top-0 bg-background">Transaction Fee</TableHead>
                    <TableHead className="sticky top-0 bg-background">Ad Fees</TableHead>
                    <TableHead className="sticky top-0 bg-background">Net Amount</TableHead>
                    <TableHead className="sticky top-0 bg-background">Total Amount</TableHead>
                    <TableHead className="sticky top-0 bg-background">Remaining</TableHead>
                    <TableHead className="sticky top-0 bg-background">Status</TableHead>
                    <TableHead className="sticky top-0 bg-background">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{format(new Date(order.orderDate), "PP")}</TableCell>
                      <TableCell>{order.orderQuantity}</TableCell>
                      <TableCell>${order.itemSubtotal.toFixed(2)}</TableCell>
                      <TableCell>${order.shippingHandling.toFixed(2)}</TableCell>
                      <TableCell>${order.taxCollected.toFixed(2)}</TableCell>
                      <TableCell>${order.transactionFee.toFixed(2)}</TableCell>
                      <TableCell>${order.adFees.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">${order.netAmount.toFixed(2)}</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>${order.remainingAmount.toFixed(2)}</TableCell>
                      <TableCell>{order.isPaid ? "Paid" : "Unpaid"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order)
                              setFormData({
                                orderNumber: order.orderNumber,
                                orderDate: format(new Date(order.orderDate), "yyyy-MM-dd"),
                                orderQuantity: order.orderQuantity.toString(),
                                itemSubtotal: order.itemSubtotal.toString(),
                                shippingHandling: order.shippingHandling.toString(),
                                taxCollected: order.taxCollected.toString(),
                                transactionFee: order.transactionFee.toString(),
                                adFees: order.adFees.toString(),
                              })
                              // setIsEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsRefundDialogOpen(true)
                            }}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRefund} className="space-y-4">
            <div>
              <Label htmlFor="refundType">Refund Type</Label>
              <Select value={refundData.type} onValueChange={(value) => setRefundData({ ...refundData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select refund type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL">Full Refund</SelectItem>
                  <SelectItem value="PARTIAL">Partial Refund</SelectItem>
                  <SelectItem value="SHIPPING">Shipping Refund</SelectItem>
                  <SelectItem value="TAX">Tax Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundData.amount}
                onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                required
              />
            </div>
            <Button type="submit">Process Refund</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

