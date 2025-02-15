import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const payouts = await prisma.payout.findMany({
      orderBy: {
        date: "desc",
      },
    })
    return NextResponse.json(payouts)
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const { date, amount, method, description } = await request.json()
    const payout = await prisma.payout.create({
      data: {
        date: new Date(date),
        amount: Number.parseFloat(amount),
        method,
        description,
      },
    })
    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error("Error creating payout:", error)
    return NextResponse.json({ error: "Failed to create payout" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

