const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1"
const API_KEY = process.env.NVIDIA_API_KEY || ""

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  }
}

export async function chat(model: string, messages: Array<{ role: string; content: string }>, maxTokens = 512) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`NVIDIA AI error (${res.status}): ${text}`)
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content || ""
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("NVIDIA AI request timed out after 10s")
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export const FREE_MODELS = {
  fast: "google/gemma-2-2b-it",
  accurate: "meta/llama-3.1-8b-instruct",
}
