"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, RefreshCcw } from 'lucide-react';
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Order = {
  id: string;
  orderNumber: string;
  orderDate: string;
  orderTotal: number;
  remainingAmount: number;
  isPaid: boolean;
};

type Payout = {
  id: string;
  date: string;
  amount: number;
  platform: "AMAZON" | "EBAY";
  method: string;
  description?: string;
  amazonOrders: Order[];
  ebayOrders: Order[];
};

type PayoutAmount = {
  orderId: string;
  amount: number;
};

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"AMAZON" | "EBAY">("AMAZON");
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [payoutAmounts, setPayoutAmounts] = useState<PayoutAmount[]>([]);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    method: "",
    description: "",
  });

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payouts");
      if (!response.ok) {
        throw new Error("Failed to fetch payouts");
      }
      const data = await response.json();
      setPayouts(data.payouts);
    } catch (error) {
      console.error("Failed to fetch payouts:", error);
      toast.error("Failed to fetch payouts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async (platform: "AMAZON" | "EBAY") => {
    try {
      const response = await fetch(`/api/${platform === "AMAZON" ? "amazon" : "ebay"}-orders/unpaid`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setAvailableOrders(data.orders);
      // Initialize payout amounts with remaining amounts
      setPayoutAmounts(data.orders.map((order: Order) => ({
        orderId: order.id,
        amount: order.remainingAmount,
      })));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  useEffect(() => {
    if (isAddDialogOpen) {
      fetchAvailableOrders(selectedPlatform);
    }
  }, [isAddDialogOpen, selectedPlatform]);

  const calculateTotal = () => {
    return payoutAmounts
      .filter((pa) => selectedOrders.includes(pa.orderId))
      .reduce((sum, pa) => sum + pa.amount, 0);
  };

  const handlePayoutAmountChange = (orderId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const order = availableOrders.find(o => o.id === orderId);
    
    if (!order) return;

    if (numAmount > order.remainingAmount) {
      toast.error(`Amount cannot exceed remaining amount: $${order.remainingAmount.toFixed(2)}`);
      return;
    }

    setPayoutAmounts(prev => {
      const existing = prev.find(pa => pa.orderId === orderId);
      if (existing) {
        return prev.map(pa => 
          pa.orderId === orderId ? { ...pa, amount: numAmount } : pa
        );
      }
      return [...prev, { orderId, amount: numAmount }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          platform: selectedPlatform,
          amount: calculateTotal(),
          orders: selectedOrders.map(orderId => ({
            id: orderId,
            amount: payoutAmounts.find(pa => pa.orderId === orderId)?.amount || 0,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payout");
      }

      toast.success("Payout created successfully");
      setIsAddDialogOpen(false);
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        method: "",
        description: "",
      });
      setSelectedOrders([]);
      setPayoutAmounts([]);
      fetchPayouts();
    } catch (error) {
      console.error("Failed to create payout:", error);
      toast.error("Failed to create payout");
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">
            Manage your Amazon and eBay payouts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Create Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Payout</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={selectedPlatform}
                      onValueChange={(value: "AMAZON" | "EBAY") => {
                        setSelectedPlatform(value);
                        setSelectedOrders([]);
                        setPayoutAmounts([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AMAZON">Amazon</SelectItem>
                        <SelectItem value="EBAY">eBay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Payout Date</Label>
                    <Input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="method">Payment Method</Label>
                    <Input
                      id="method"
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select Orders</h3>
                    <p className="text-muted-foreground">
                      Total Payout: ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                  <ScrollArea className="h-[300px] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Order Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Remaining</TableHead>
                          <TableHead>Payout Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {availableOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedOrders.includes(order.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedOrders(
                                    checked
                                      ? [...selectedOrders, order.id]
                                      : selectedOrders.filter((id) => id !== order.id)
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>{format(new Date(order.orderDate), "PP")}</TableCell>
                            <TableCell>${order.orderTotal.toFixed(2)}</TableCell>
                            <TableCell>${order.remainingAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={payoutAmounts.find(pa => pa.orderId === order.id)?.amount || 0}
                                onChange={(e) => handlePayoutAmountChange(order.id, e.target.value)}
                                step="0.01"
                                min="0"
                                max={order.remainingAmount}
                                disabled={!selectedOrders.includes(order.id)}
                                className="w-24"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                <Button type="submit" disabled={selectedOrders.length === 0 || calculateTotal() === 0}>
                  Create Payout
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={fetchPayouts}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payouts History</CardTitle>
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
                    <TableHead className="sticky top-0 bg-background">Date</TableHead>
                    <TableHead className="sticky top-0 bg-background">Platform</TableHead>
                    <TableHead className="sticky top-0 bg-background">Method</TableHead>
                    <TableHead className="sticky top-0 bg-background">Amount</TableHead>
                    <TableHead className="sticky top-0 bg-background">Orders</TableHead>
                    <TableHead className="sticky top-0 bg-background">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{format(new Date(payout.date), "PP")}</TableCell>
                      <TableCell>{payout.platform}</TableCell>
                      <TableCell>{payout.method}</TableCell>
                      <TableCell>${payout.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {payout.platform === "AMAZON"
                          ? payout.amazonOrders.length
                          : payout.ebayOrders.length}{" "}
                        orders
                      </TableCell>
                      <TableCell>{payout.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
