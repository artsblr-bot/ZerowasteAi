import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId, req.nextUrl.searchParams.get("branchId"))

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const [totalOrders, monthlyDonations, monthlyFoodBatches, lastPrediction] = await Promise.all([
      prisma.order.count({ where: { branchId, orderTime: { gte: today } } }),
      prisma.donation.findMany({
        where: { foodBatch: { branchId }, createdAt: { gte: thisMonth } },
        select: { weightKg: true, mealEquivalent: true },
      }),
      prisma.foodBatch.findMany({
        where: { branchId, preparedAt: { gte: thisMonth } },
        select: { quantityPrepared: true, quantitySold: true, quantityDonated: true, quantityWasted: true },
      }),
      prisma.prediction.findFirst({
        where: { branchId, type: "demand" },
        orderBy: { madeAt: "desc" },
      }),
    ])

    const mealsSaved = monthlyDonations.reduce((sum, d) => sum + (d.mealEquivalent ?? 0), 0)
    const co2Avoided = monthlyDonations.reduce((sum, d) => sum + d.weightKg * 3.5, 0)
    const totalPrepared = monthlyFoodBatches.reduce((sum, b) => sum + b.quantityPrepared, 0)
    const totalSold = monthlyFoodBatches.reduce((sum, b) => sum + b.quantitySold, 0)
    const totalWasted = monthlyFoodBatches.reduce((sum, b) => sum + b.quantityWasted, 0)

    return NextResponse.json({
      todayOrders: totalOrders,
      monthlyDonations: monthlyDonations.length,
      mealsSaved: Math.round(mealsSaved),
      co2Avoided: Math.round(co2Avoided),
      totalPrepared,
      totalSold,
      totalWasted,
      wasteRate: totalPrepared > 0 ? Math.round((totalWasted / totalPrepared) * 100) : 0,
      lastPrediction: lastPrediction
        ? {
            predictedValue: lastPrediction.predictedValue,
            confidenceScore: lastPrediction.confidenceScore,
            madeAt: lastPrediction.madeAt,
          }
        : null,
    })
  } catch (err) {
    console.error("Stats error:", err)
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 })
  }
}
