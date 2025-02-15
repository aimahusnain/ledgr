// app/api/amazon-orders/add/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const orderTotal = 
      (data.subtotal || 0) +
      (data.shippingHandling || 0) +
      (data.taxCollected || 0) -
      (data.giftCardAmount || 0);

    const order = await db.amazonOrder.create({
      data: {
        ...data,
        orderTotal,
        orderDate: new Date(data.orderDate).toISOString(),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create order ${error}` },
      { status: 500 }
    );
  }
}