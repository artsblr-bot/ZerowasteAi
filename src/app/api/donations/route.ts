import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = req.nextUrl.searchParams.get("branchId")
    const status = req.nextUrl.searchParams.get("status")

    const where: Record<string, unknown> = {}
    if (branchId) where.foodBatch = { branchId }
    if (status) where.status = status

    const donations = await prisma.donation.findMany({
      where,
      include: {
        ngo: { select: { id: true, name: true } },
        foodBatch: { include: { dish: true, branch: true } },
        volunteer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ donations })
  } catch (err) {
    console.error("Donations error:", err)
    return NextResponse.json({ error: "Failed to load donations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { foodBatchId, ngoId, weightKg } = body

    const donation = await prisma.donation.create({
      data: {
        foodBatchId,
        ngoId,
        weightKg,
        mealEquivalent: Math.round(weightKg * 2),
        status: "pending",
      },
      include: { ngo: true, foodBatch: { include: { dish: true } } },
    })

    await prisma.foodBatch.update({
      where: { id: foodBatchId },
      data: { quantityDonated: { increment: Math.round(weightKg / 0.25) } },
    })

    return NextResponse.json({ donation })
  } catch (err) {
    console.error("Create donation error:", err)
    return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
  }
}
