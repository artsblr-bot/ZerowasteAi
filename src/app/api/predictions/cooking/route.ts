import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { predictCookingRecommendation } from "@/lib/nvidia"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId, req.nextUrl.searchParams.get("branchId"))
    const predictedCustomers = parseInt(req.nextUrl.searchParams.get("customers") || "0")

    const dishes = await prisma.dish.findMany({
      where: { menu: { branchId, isActive: true } },
      include: { ingredients: true, foodBatches: { orderBy: { preparedAt: "desc" }, take: 7 } },
    })

    const recommendations = []

    for (const dish of dishes) {
      const historicalSales = dish.foodBatches.map((b) => b.quantitySold)
      const avgSales = historicalSales.length > 0
        ? Math.round(historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length)
        : 0

      const popularity = dish.popularityScore ?? 0.5
      const costPerDish = dish.ingredients.reduce((sum, ing) => sum + (ing.quantityPerDish * 2), 0)
      const price = dish.avgPrice ?? 100

      const fullPrep = predictedCustomers > 0 ? Math.round(predictedCustomers * popularity) : avgSales * 2

      const result = await predictCookingRecommendation({
        dishName: dish.name,
        predictedCustomers,
        historicalSales: historicalSales.slice(0, 7),
        dishPopularity: popularity,
        costPerDish,
        pricePerDish: price,
      })

      const recommended = result.recommendedQuantity || Math.round(fullPrep * 0.85)

      recommendations.push({
        dishId: dish.id,
        dishName: dish.name,
        planned: fullPrep,
        recommended,
        savings: result.estimatedSavings || (fullPrep - recommended) * costPerDish,
        confidence: result.confidence || 0.85,
      })
    }

    const totalSavings = recommendations.reduce((sum, r) => sum + r.savings, 0)

    return NextResponse.json({
      recommendations,
      totalSavings: Math.round(totalSavings),
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Cooking prediction error:", err)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
