import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { predictSurplus } from "@/lib/nvidia"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId, req.nextUrl.searchParams.get("branchId"))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const batches = await prisma.foodBatch.findMany({
      where: {
        branchId,
        preparedAt: { gte: today },
      },
    })

    const totalPrepared = batches.reduce((sum, b) => sum + b.quantityPrepared, 0)
    const totalSold = batches.reduce((sum, b) => sum + b.quantitySold, 0)

    const recentBatches = await prisma.foodBatch.findMany({
      where: { branchId },
      orderBy: { preparedAt: "desc" },
      take: 30,
    })

    const leftoverPcts = recentBatches
      .filter((b) => b.quantityPrepared > 0)
      .map((b) => (b.quantityLeftover / b.quantityPrepared) * 100)
    const avgLeftoverPct = leftoverPcts.length > 0
      ? Math.round(leftoverPcts.reduce((a, b) => a + b, 0) / leftoverPcts.length)
      : 15

    const closestPrediction = await prisma.prediction.findFirst({
      where: { branchId, type: "demand", madeAt: { gte: today } },
      orderBy: { madeAt: "desc" },
    })

    const expectedCustomers = closestPrediction?.predictedValue ?? 0
    const customersSoFar = totalSold

    const result = await predictSurplus({
      totalPrepared,
      totalSold,
      customersSoFar,
      expectedCustomers,
      timeUntilClose: 4,
      historicalLeftoverPct: avgLeftoverPct,
    })

    return NextResponse.json({
      expectedSurplus: result.expectedSurplus || Math.round(totalPrepared * (avgLeftoverPct / 100)),
      readyAt: result.readyAt || "9:20 PM",
      confidence: result.confidence || 0.75,
      totalPrepared,
      totalSold,
      avgLeftoverPct,
    })
  } catch (err) {
    console.error("Surplus prediction error:", err)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
