// app/api/amazon-orders/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const orders = await db.amazonOrder.findMany({
      orderBy: {
        orderDate: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch orders ${error}` },
      { status: 500 }
    );
  }
}