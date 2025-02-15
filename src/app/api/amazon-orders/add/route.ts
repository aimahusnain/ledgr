import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Input validation
    if (!data.orderNumber || !data.orderDate || !data.paymentMethod) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Validate numeric fields
    const numericFields = [
      'numberOfItems',
      'subtotal',
      'additionalFee',
      'shippingHandling',
      'taxCollected',
      'giftCardAmount'
    ];

    for (const field of numericFields) {
      if (isNaN(Number(data[field]))) {
        return NextResponse.json({ 
          success: false, 
          error: `Invalid numeric value for ${field}` 
        }, { status: 400 });
      }
    }

    // Calculate order total
    const orderTotal = 
      Number(data.subtotal) +
      Number(data.additionalFee) +
      Number(data.shippingHandling) +
      Number(data.taxCollected) -
      Number(data.giftCardAmount);

    // Prepare order data with proper type conversion
    const orderData = {
      orderNumber: data.orderNumber,
      orderDate: new Date(data.orderDate),
      numberOfItems: Number(data.numberOfItems),
      paymentMethod: data.paymentMethod,
      subtotal: Number(data.subtotal),
      additionalFee: Number(data.additionalFee),
      shippingHandling: Number(data.shippingHandling),
      taxCollected: Number(data.taxCollected),
      giftCardAmount: Number(data.giftCardAmount),
      orderTotal,
      refundType: data.refundType || null,
      refundAmount: data.refundAmount ? String(data.refundAmount) : null
    };

    // Check if order number already exists
    const existingOrder = await db.amazonOrder.findUnique({
      where: { orderNumber: orderData.orderNumber }
    });

    if (existingOrder) {
      return NextResponse.json({ 
        success: false, 
        error: "Order number already exists" 
      }, { status: 409 });
    }

    // Create the order
    const order = await db.amazonOrder.create({
      data: orderData
    });

    return NextResponse.json({ 
      success: true, 
      data: order 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    
    // Check for specific Prisma errors
    if (error === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: "Order number must be unique" 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      success: false, 
      error: "Failed to create order" 
    }, { status: 500 });
  }
}