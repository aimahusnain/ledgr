import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { date, amount, method, description } = await request.json()
    const updatedPayout = await prisma.payout.update({
      where: { id: params.id },
      data: {
        date: new Date(date),
        amount: Number.parseFloat(amount),
        method,
        description,
      },
    })
    return NextResponse.json(updatedPayout)
  } catch (error) {
    console.error("Error updating payout:", error)
    return NextResponse.json({ error: "Failed to update payout" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.payout.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Payout deleted successfully" })
  } catch (error) {
    console.error("Error deleting payout:", error)
    return NextResponse.json({ error: "Failed to delete payout" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

