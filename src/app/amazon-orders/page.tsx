"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Edit, Loader2, MoreHorizontal, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AmazonOrder = {
  id: string;
  orderNumber: string;
  orderDate: string;
  numberOfItems: number;
  paymentMethod: string;
  subtotal: number;
  additionalFee: number;
  shippingHandling: number;
  taxCollected: number;
  giftCardAmount: number;
  orderTotal: number;
  refundType?: string;
  refundAmount?: number;
};

const AmazonOrderTable = () => {
  const [orders, setOrders] = useState<AmazonOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<AmazonOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/amazon-orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log(error)
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAddOrder = async (formData: FormData) => {
    try {
      const orderData = {
        orderNumber: formData.get("orderNumber"),
        orderDate: formData.get("orderDate"),
        numberOfItems: Number(formData.get("numberOfItems")),
        paymentMethod: formData.get("paymentMethod"),
        subtotal: Number(formData.get("subtotal")),
        additionalFee: Number(formData.get("additionalFee")),
        shippingHandling: Number(formData.get("shippingHandling")),
        taxCollected: Number(formData.get("taxCollected")),
        giftCardAmount: Number(formData.get("giftCardAmount")),
        refundType: formData.get("refundType") || undefined,
        refundAmount: formData.get("refundAmount") ? Number(formData.get("refundAmount")) : undefined,
      };

      const response = await fetch("/api/amazon-orders/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to add order");

      toast.success("Order added successfully");
      setIsAddDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.log(error)
      toast.error("Failed to add order");
    }
  };

  const handleUpdateOrder = async (formData: FormData) => {
    if (!currentOrder) return;

    try {
      const orderData = {
        orderNumber: formData.get("orderNumber"),
        orderDate: formData.get("orderDate"),
        numberOfItems: Number(formData.get("numberOfItems")),
        paymentMethod: formData.get("paymentMethod"),
        subtotal: Number(formData.get("subtotal")),
        additionalFee: Number(formData.get("additionalFee")),
        shippingHandling: Number(formData.get("shippingHandling")),
        taxCollected: Number(formData.get("taxCollected")),
        giftCardAmount: Number(formData.get("giftCardAmount")),
        refundType: formData.get("refundType") || undefined,
        refundAmount: formData.get("refundAmount") ? Number(formData.get("refundAmount")) : undefined,
      };

      const response = await fetch(`/api/amazon-orders/update/${currentOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to update order");

      toast.success("Order updated successfully");
      setIsEditDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.log(error)
      toast.error("Failed to update order");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(`/api/amazon-orders/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete order");

      toast.success("Order deleted successfully");
      fetchOrders();
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete order");
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <CardHeader className="px-0 pt-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Amazon Orders</CardTitle>
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
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Order
              </Button>
              <Button variant="outline" onClick={fetchOrders}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{format(new Date(order.orderDate), "dd MMM yyyy")}</TableCell>
                      <TableCell>{order.numberOfItems}</TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        ${order.orderTotal.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setCurrentOrder(order);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteOrder(order.id)}
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
      </Card>

      {/* Add Order Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
          </DialogHeader>
<form onSubmit={(e) => {
  e.preventDefault();
  handleAddOrder(new FormData(e.currentTarget));
}}>
  <div className="grid gap-6 py-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="orderNumber">Order Number</Label>
        <Input
          id="orderNumber"
          name="orderNumber"
          placeholder="Enter order number"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="orderDate">Order Date</Label>
        <Input
          id="orderDate"
          name="orderDate"
          type="date"
          defaultValue={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="numberOfItems">Number of Items</Label>
        <Input
          id="numberOfItems"
          name="numberOfItems"
          type="number"
          min="1"
          defaultValue="1"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Input
          id="paymentMethod"
          name="paymentMethod"
          placeholder="Enter payment method"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="subtotal">Subtotal ($)</Label>
        <Input
          id="subtotal"
          name="subtotal"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="additionalFee">Additional Fee ($)</Label>
        <Input
          id="additionalFee"
          name="additionalFee"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="shippingHandling">Shipping & Handling ($)</Label>
        <Input
          id="shippingHandling"
          name="shippingHandling"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="taxCollected">Tax Collected ($)</Label>
        <Input
          id="taxCollected"
          name="taxCollected"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
          required
        />
      </div>
    </div>

    <div className="grid gap-2">
      <Label htmlFor="giftCardAmount">Gift Card Amount ($)</Label>
      <Input
        id="giftCardAmount"
        name="giftCardAmount"
        type="number"
        step="0.01"
        min="0"
        defaultValue="0"
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="refundType">Refund Type (Optional)</Label>
        <Input
          id="refundType"
          name="refundType"
          placeholder="Enter refund type"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="refundAmount">Refund Amount ($) (Optional)</Label>
        <Input
          id="refundAmount"
          name="refundAmount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </div>
    </div>
  </div>
  <Button type="submit" className="w-full">Add Order</Button>
</form>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          {currentOrder && (
  <form onSubmit={(e) => {
    e.preventDefault();
    handleUpdateOrder(new FormData(e.currentTarget));
  }}>
    <div className="grid gap-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="edit-orderNumber">Order Number</Label>
          <Input
            id="edit-orderNumber"
            name="orderNumber"
            defaultValue={currentOrder.orderNumber}
            required
          />
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
          <Input
            id="edit-refundType"
            name="refundType"
            defaultValue={currentOrder.refundType}
          />
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
    <Button type="submit" className="w-full">Update Order</Button>
  </form>
)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AmazonOrderTable;