interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  rainProbability: number
}

export async function getWeather(city: string = "Bangalore"): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  if (!apiKey) return null

  try {
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`,
    )
    const geo = await geoRes.json()
    if (!geo.length) return null

    const { lat, lon } = geo[0]
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
    )
    const data = await weatherRes.json()

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0]?.description || "Clear",
      humidity: data.main.humidity,
      rainProbability: (data.clouds?.all ?? 0) * 0.8,
    }
  } catch {
    return null
  }
}

export function getWeatherImpact(condition?: string): { label: string; impact: string } | null {
  if (!condition) return null
  const lower = condition.toLowerCase()
  if (lower.includes("rain") || lower.includes("drizzle") || lower.includes("thunderstorm")) {
    return { label: "Weather Impact", impact: "-18% walk-ins expected" }
  }
  if (lower.includes("cloud") || lower.includes("overcast")) {
    return { label: "Weather Impact", impact: "-5% walk-ins expected" }
  }
  if (lower.includes("clear") || lower.includes("sun")) {
    return { label: "Weather Impact", impact: "+5% walk-ins expected" }
  }
  return null
}
