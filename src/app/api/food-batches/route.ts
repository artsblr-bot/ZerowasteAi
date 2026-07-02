import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const batches = await prisma.foodBatch.findMany({
      where: { branchId, preparedAt: { gte: today } },
      include: { dish: true },
      orderBy: { preparedAt: "desc" },
    })

    return NextResponse.json({ batches })
  } catch (err) {
    console.error("Food batches GET error:", err)
    return NextResponse.json({ error: "Failed to load batches" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId)
    const { dishId, quantityPrepared, quantitySold } = await req.json()

    if (!dishId || quantityPrepared == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const leftover = Math.max(0, quantityPrepared - quantitySold)

    const batch = await prisma.foodBatch.create({
      data: {
        quantityPrepared,
        quantitySold: quantitySold ?? 0,
        quantityLeftover: leftover,
        quantityDonated: 0,
        quantityWasted: 0,
        preparedAt: new Date(),
        servedUntil: new Date(Date.now() + 12 * 3600000),
        isSafeForDonation: true,
        branchId,
        dishId,
      },
    })

    return NextResponse.json({ batch })
  } catch (err) {
    console.error("Food batch error:", err)
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 })
  }
}
