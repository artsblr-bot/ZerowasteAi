import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { predictDemand } from "@/lib/nvidia"
import { aiPredictDemand } from "@/lib/prediction"
import { getWeather } from "@/lib/weather"
import { getNearbyEvents } from "@/lib/events"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId, req.nextUrl.searchParams.get("branchId"))
    const date = req.nextUrl.searchParams.get("date") || new Date().toISOString().split("T")[0]

    const today = new Date(date)
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayOfWeek = dayNames[today.getDay()]

    const weather = await getWeather()
    const events = await getNearbyEvents()

    const recentDays = await prisma.prediction.findMany({
      where: { branchId, type: "demand" },
      orderBy: { madeAt: "desc" },
      take: 30,
      select: { predictedValue: true, actualValue: true },
    })

    const historicalSales = recentDays
      .filter((p) => p.actualValue !== null)
      .map((p) => p.actualValue as number)

    const reservations = await prisma.reservation.count({
      where: { branchId, status: "confirmed" },
    })

    const recentOrders = await prisma.order.findMany({
      where: { branchId, orderTime: { gte: new Date(Date.now() - 7 * 86400000) } },
      take: 7,
      select: { id: true },
    })

    const histAvg = historicalSales.length
      ? Math.round(historicalSales.reduce((a, b) => a + b, 0) / historicalSales.length)
      : 280

    const aiResult = await aiPredictDemand({
      dayOfWeek,
      date,
      weather: weather?.condition,
      temperature: weather?.temperature,
      reservations,
      specialEvents: events?.map((e: any) => e.name || "event") || [],
      recentOrders: recentOrders.map(() => Math.round(280 + Math.random() * 60 - 30)),
      historicalAvg: histAvg,
    })

    const result = aiResult || await predictDemand({
      dayOfWeek,
      date,
      weather: weather?.condition,
      temperature: weather?.temperature,
      reservations,
      historicalData: { last_4_same_days_avg: histAvg },
      specialEvents: events?.map((e: any) => e.name || "event") || [],
    })

    const prediction = await prisma.prediction.create({
      data: {
        type: "demand",
        branchId,
        predictedValue: result.predictedCustomers,
        confidenceScore: result.confidence,
        inputSnapshot: JSON.stringify({ dayOfWeek, date, weather: weather?.condition, temperature: weather?.temperature, reservations }),
        modelVersion: aiResult ? "nvidia-llama-3.1-8b" : "statistical-v2",
      },
    })

    const factors = [
      { label: "Day of Week", impact: dayOfWeek },
      { label: "Reservations", impact: `${reservations} booked` },
      { label: "How Sure", impact: `${Math.round(result.confidence * 100)}%` },
      ...(weather ? [{ label: "Weather", impact: `${weather.condition} (${weather.temperature}°C)` }] : []),
      ...(aiResult ? [{ label: "AI Engine", impact: aiResult.reason }] : []),
    ]

    return NextResponse.json({
      id: prediction.id,
      predictedCustomers: result.predictedCustomers,
      confidence: result.confidence,
      factors,
    })
  } catch (err) {
    console.error("Demand prediction error:", err)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
