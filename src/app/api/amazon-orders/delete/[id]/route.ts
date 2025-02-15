import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  // req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await db.amazonOrder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to delete order: ${error}` },
      { status: 500 }
    );
  }
}
