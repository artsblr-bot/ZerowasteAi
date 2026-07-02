import { chat, FREE_MODELS } from "./ai"

export async function aiPredictDemand(context: {
  dayOfWeek: string
  date: string
  weather?: string
  temperature?: number
  reservations: number
  specialEvents: string[]
  recentOrders: number[]
  historicalAvg: number
}) {
  const prompt = `You are a restaurant demand forecaster. Given the following data, predict how many customers will visit today.

Day: ${context.dayOfWeek}
Date: ${context.date}
Weather: ${context.weather || "unknown"} (${context.temperature ?? "?"}°C)
Reservations: ${context.reservations}
Special Events: ${context.specialEvents.join(", ") || "none"}
Recent orders (last 7 days): [${context.recentOrders.join(", ")}]
Historical average for this day: ${context.historicalAvg}

Respond in this EXACT format (no extra text):
PREDICTED: <number between 50 and 500>
CONFIDENCE: <number between 0 and 1>
REASON: <1 sentence explaining the main factor>`

  try {
    const response = await chat(FREE_MODELS.accurate, [{ role: "user", content: prompt }])
    const predicted = parseInt(response.match(/PREDICTED:\s*(\d+)/)?.[1] || "0", 10)
    const confidence = parseFloat(response.match(/CONFIDENCE:\s*([\d.]+)/)?.[1] || "0.5")
    const reason = response.match(/REASON:\s*(.+)/)?.[1] || "Based on historical patterns"
    return {
      predictedCustomers: Math.max(50, Math.min(500, predicted)),
      confidence: Math.max(0, Math.min(1, confidence)),
      reason,
    }
  } catch {
    return null
  }
}

export async function aiPredictDish(dishName: string, context: {
  predictedCustomers: number
  avgSales: number
  popularity: number
  costPerDish: number
  pricePerDish: number
}) {
  const prompt = `You are a kitchen advisor. Recommend how many portions of "${dishName}" to prepare today.

Predicted total customers today: ${context.predictedCustomers}
Average sales of this dish: ${context.avgSales}
Dish popularity score (0-1): ${context.popularity}
Cost per dish: ₹${context.costPerDish}
Price per dish: ₹${context.pricePerDish}

Respond in EXACT format:
RECOMMEND: <integer>
SAVINGS: <integer in rupees>
REASON: <1 sentence>`

  try {
    const response = await chat(FREE_MODELS.fast, [{ role: "user", content: prompt }])
    const recommended = parseInt(response.match(/RECOMMEND:\s*(\d+)/)?.[1] || "0", 10)
    const savings = parseInt(response.match(/SAVINGS:\s*(\d+)/)?.[1] || "0", 10)
    const reason = response.match(/REASON:\s*(.+)/)?.[1] || ""
    return { recommended: Math.max(1, recommended), savings, reason }
  } catch {
    return null
  }
}
