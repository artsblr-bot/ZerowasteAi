// Free, no-API-required statistical prediction engine
// Uses proven time-series methods (moving average, trend, seasonality)

export async function predictDemand(context: {
  dayOfWeek: string
  date: string
  weather?: string
  temperature?: number
  reservations: number
  historicalData: Record<string, number>
  specialEvents: string[]
}): Promise<{
  predictedCustomers: number
  confidence: number
  factors: Array<{ label: string; impact: string }>
}> {
  const factors: Array<{ label: string; impact: string }> = []
  let base = 280

  // Day-of-week multiplier
  const dayMultipliers: Record<string, number> = {
    Monday: 0.75, Tuesday: 0.85, Wednesday: 0.9,
    Thursday: 1.0, Friday: 1.25, Saturday: 1.4, Sunday: 1.3,
  }
  const dowFactor = dayMultipliers[context.dayOfWeek] || 1.0
  factors.push({ label: "Day of Week", impact: `${Math.round((dowFactor - 1) * 100)}% vs avg` })
  base *= dowFactor

  // Historical data adjustment
  const histAvg = context.historicalData.last_4_same_days_avg
  if (histAvg > 0) {
    const histRatio = histAvg / base
    base = base * (0.4 + 0.6 * Math.min(histRatio, 1.5))
    factors.push({ label: "Historical Trend", impact: `Avg ${histAvg} customers on this day` })
  }

  // Weather impact (optional)
  if (context.weather) {
    const weatherLower = context.weather.toLowerCase()
    if (weatherLower.includes("rain") || weatherLower.includes("drizzle") || weatherLower.includes("thunderstorm")) {
      base *= 0.82
      factors.push({ label: "Weather Impact", impact: "-18% walk-ins (rain)" })
    } else if (weatherLower.includes("clear") || weatherLower.includes("sun")) {
      base *= 1.05
      factors.push({ label: "Weather Impact", impact: "+5% walk-ins (clear)" })
    } else if (weatherLower.includes("cloud") || weatherLower.includes("overcast")) {
      base *= 0.95
      factors.push({ label: "Weather Impact", impact: "-5% walk-ins (cloudy)" })
    } else {
      factors.push({ label: "Weather Impact", impact: "Minimal" })
    }
  }

  // Temperature adjustment (optional)
  if (context.temperature !== undefined && context.temperature !== null) {
    if (context.temperature > 35) {
      base *= 0.85
      factors.push({ label: "Temperature", impact: "-15% (extreme heat)" })
    } else if (context.temperature < 15) {
      base *= 0.9
      factors.push({ label: "Temperature", impact: "-10% (cold weather)" })
    } else {
      factors.push({ label: "Temperature", impact: `${context.temperature}°C — normal` })
    }
  }

  // Reservations
  base += context.reservations * 0.85
  factors.push({ label: "Reservations", impact: `${context.reservations} booked` })

  // Events
  context.specialEvents.forEach((ev) => {
    factors.push({ label: ev, impact: "+8% traffic expected" })
  })
  base *= 1 + context.specialEvents.length * 0.08

  const predictedCustomers = Math.round(Math.max(base, 50))
  const confidence = Math.min(0.75 + context.specialEvents.length * 0.03 + (histAvg > 0 ? 0.1 : 0), 0.95)

  return { predictedCustomers, confidence, factors }
}

export async function predictCookingRecommendation(context: {
  dishName: string
  predictedCustomers: number
  historicalSales: number[]
  dishPopularity: number
  costPerDish: number
  pricePerDish: number
}): Promise<{
  recommendedQuantity: number
  estimatedSavings: number
  confidence: number
}> {
  const avgSales = context.historicalSales.length > 0
    ? context.historicalSales.reduce((a, b) => a + b, 0) / context.historicalSales.length
    : 20

  const customerRatio = context.predictedCustomers / 280
  const popBoost = (context.dishPopularity - 0.5) * 0.3
  const rawRec = Math.round(avgSales * customerRatio * (1 + popBoost))

  const recommendedQuantity = Math.max(rawRec, 5)
  const margin = context.pricePerDish - context.costPerDish
  const overPrep = Math.round(avgSales * 0.15)
  const estimatedSavings = Math.round(overPrep * margin * customerRatio)

  const confidence = Math.min(0.7 + context.dishPopularity * 0.2 + (context.historicalSales.length > 5 ? 0.1 : 0), 0.95)

  return { recommendedQuantity, estimatedSavings, confidence }
}

export async function predictSurplus(context: {
  totalPrepared: number
  totalSold: number
  customersSoFar: number
  expectedCustomers: number
  timeUntilClose: number
  historicalLeftoverPct: number
}): Promise<{
  expectedSurplus: number
  readyAt: string
  confidence: number
}> {
  const remainingCustomers = Math.max(context.expectedCustomers - context.customersSoFar, 0)
  const salesRate = context.customersSoFar > 0 ? context.totalSold / context.customersSoFar : 0.8
  const expectedFutureSales = Math.round(remainingCustomers * salesRate)
  const totalExpectedSold = context.totalSold + expectedFutureSales
  const rawSurplus = Math.max(context.totalPrepared - totalExpectedSold, 0)

  const leftoverRate = context.historicalLeftoverPct > 0 ? context.historicalLeftoverPct / 100 : 0.12
  const adjustment = 1 + (leftoverRate - 0.12) * 0.5

  const expectedSurplus = Math.round(rawSurplus * adjustment * 0.4)

  const now = new Date()
  const readyMinutes = Math.round(context.timeUntilClose * 60 * 0.6)
  const readyAt = new Date(now.getTime() + readyMinutes * 60000)
  const readyTimeStr = readyAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })

  const confidence = Math.min(0.6 + context.timeUntilClose * 0.02 + (context.historicalLeftoverPct > 0 ? 0.1 : 0), 0.9)

  return { expectedSurplus, readyAt: readyTimeStr, confidence }
}

export async function matchNGOs(context: {
  surplusKg: number
  foodType: string
  restaurantLat: number
  restaurantLng: number
  ngos: Array<{
    id: string
    name: string
    lat: number
    lng: number
    maxCapacityKg: number
    currentStorageKg: number
    storageType: string
  }>
}): Promise<Array<{ ngoId: string; matchScore: number; reason: string }>> {
  function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const results = context.ngos
    .filter((ngo) => ngo.lat && ngo.lng)
    .map((ngo) => {
      const distance = haversine(context.restaurantLat, context.restaurantLng, ngo.lat, ngo.lng)
      const capacityRemaining = (ngo.maxCapacityKg || 100) - ngo.currentStorageKg
      const distanceScore = Math.max(0, 100 - distance * 5)
      const capacityScore = Math.min(100, (capacityRemaining / Math.max(context.surplusKg, 1)) * 50)
      const matchScore = Math.round(Math.min(distanceScore + capacityScore, 100))

      let reason = ""
      if (distance < 3) reason = "Very close proximity · "
      else if (distance < 7) reason = "Nearby location · "
      else reason = "Within service area · "
      reason += capacityRemaining >= context.surplusKg ? "Sufficient capacity" : "Limited capacity"

      return { ngoId: ngo.id, matchScore, reason }
    })

  return results.sort((a, b) => b.matchScore - a.matchScore)
}
