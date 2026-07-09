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


