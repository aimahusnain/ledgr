// app/api/amazon-orders/[id]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    const orderTotal = 
      (data.subtotal || 0) +
      (data.shippingHandling || 0) +
      (data.taxCollected || 0) -
      (data.giftCardAmount || 0);

    const order = await db.amazonOrder.update({
      where: { id: params.id },
      data: {
        ...data,
        orderTotal,
        orderDate: new Date(data.orderDate).toISOString(),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update order ${error}` },
      { status: 500 }
    );
  }
}