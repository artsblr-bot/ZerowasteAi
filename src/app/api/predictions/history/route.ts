import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId, req.nextUrl.searchParams.get("branchId"))
    const days = parseInt(req.nextUrl.searchParams.get("days") || "60")

    const predictions = await prisma.prediction.findMany({
      where: {
        branchId,
        type: "demand",
        madeAt: { gte: new Date(Date.now() - days * 86400000) },
      },
      orderBy: { madeAt: "asc" },
      select: {
        id: true,
        predictedValue: true,
        actualValue: true,
        confidenceScore: true,
        error: true,
        madeAt: true,
      },
    })

    const accuracyOverTime = predictions.map((p) => ({
      week: Math.ceil((Date.now() - p.madeAt.getTime()) / (7 * 86400000)),
      predicted: p.predictedValue,
      actual: p.actualValue,
      confidence: p.confidenceScore,
      error: p.error,
      date: p.madeAt.toISOString().split("T")[0],
    }))

    return NextResponse.json({
      total: predictions.length,
      accuracyOverTime,
      latestAccuracy: predictions
        .filter((p) => p.actualValue !== null)
        .slice(-10)
        .reduce(
          (acc, p) => ({
            count: acc.count + 1,
            totalError: acc.totalError + (p.error ?? Math.abs(p.predictedValue - (p.actualValue ?? p.predictedValue))),
          }),
          { count: 0, totalError: 0 },
        ),
    })
  } catch (err) {
    console.error("History error:", err)
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 })
  }
}
