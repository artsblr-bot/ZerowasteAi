const BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi<{ token: string; user: Record<string, unknown> }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (data: {
      email: string
      password: string
      name: string
      phone?: string
      role?: string
      cuisineType?: string
      organizationName: string
      organizationType: string
    }) =>
      fetchApi<{ token: string; user: Record<string, unknown> }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  restaurants: {
    stats: (branchId?: string) =>
      fetchApi<{
        todayOrders: number
        monthlyDonations: number
        mealsSaved: number
        co2Avoided: number
        totalPrepared: number
        totalSold: number
        wasteRate: number
        lastPrediction: { predictedValue: number; confidenceScore: number; madeAt: string } | null
      }>(`/restaurants/stats?branchId=${branchId || "default"}`),
  },

  predictions: {
    demand: (branchId?: string) =>
      fetchApi<{
        predictedCustomers: number
        confidence: number
        factors: Array<{ label: string; impact: string }>
      }>(`/predictions/demand?branchId=${branchId || "default"}`),
    cooking: (branchId?: string, customers?: number) =>
      fetchApi<{
        recommendations: Array<{
          dishId: string
          dishName: string
          planned: number
          recommended: number
          savings: number
          confidence: number
        }>
        totalSavings: number
      }>(`/predictions/cooking?branchId=${branchId || "default"}&customers=${customers || 0}`),
    surplus: (branchId?: string) =>
      fetchApi<{
        expectedSurplus: number
        readyAt: string
        confidence: number
        totalPrepared: number
        totalSold: number
        avgLeftoverPct: number
      }>(`/predictions/surplus?branchId=${branchId || "default"}`),
    history: (branchId?: string) =>
      fetchApi<{
        total: number
        accuracyOverTime: Array<{
          predicted: number
          actual: number
          confidence: number
          error: number
          date: string
        }>
        latestAccuracy: { count: number; totalError: number }
      }>(`/predictions/history?branchId=${branchId || "default"}`),
  },

  menu: {
    list: (branchId?: string) =>
      fetchApi<{
        menus: Array<{
          id: string
          name: string
          dishes: Array<{
            id: string
            name: string
            category: string | null
            avgPrice: number | null
            prepTime: number | null
            isSignature: boolean
            popularityScore: number | null
            ingredients: Array<{
              id: string
              name: string
              quantityPerDish: number
              unit: string
            }>
          }>
        }>
      }>(`/menu?branchId=${branchId || "default"}`),
  },

  inventory: {
    list: (branchId?: string) =>
      fetchApi<{
        items: Array<{
          id: string
          ingredientName: string
          quantity: number
          unit: string
          threshold: number | null
          expiryDate: string | null
          costPerUnit: number | null
        }>
        lowStock: Array<Record<string, unknown>>
        expiringToday: Array<Record<string, unknown>>
        totals: { count: number; lowStockCount: number; expiringCount: number; totalValue: number }
      }>(`/inventory?branchId=${branchId || "default"}`),
  },

  donations: {
    list: (params?: { branchId?: string; status?: string }) =>
      fetchApi<{
        donations: Array<{
          id: string
          weightKg: number
          mealEquivalent: number | null
          status: string
          pickupTime: string | null
          deliveryTime: string | null
          ngo: { id: string; name: string } | null
          foodBatch: {
            dish: { name: string; category: string | null }
            branch: { name: string }
          }
          volunteer: { id: string; name: string } | null
          createdAt: string
        }>
      }>(
        `/donations?${new URLSearchParams(
          Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][],
        ).toString()}`,
      ),
    create: (data: { foodBatchId: string; ngoId: string; weightKg: number }) =>
      fetchApi<Record<string, unknown>>("/donations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchApi<{ donation: Record<string, unknown>; qrCode?: string }>(`/donations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    getById: (id: string) =>
      fetchApi<{ donation: Record<string, unknown> }>(`/donations/${id}`),
  },

  ngos: {
    list: () =>
      fetchApi<{
        ngos: Array<{
          id: string
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          maxCapacityKg: number | null
          currentStorageKg: number
          storageType: string | null
          serviceAreaRadiusKm: number | null
          phone: string | null
          contactPerson: string | null
        }>
      }>("/ngos"),
  },

  connectors: {
    status: () =>
      fetchApi<{ services: Array<{ service: string; connected: boolean; scope: string; expiresAt: string | null; type: string; serviceName?: string }> }>("/connectors/status"),
    gmail: () =>
      fetchApi<{ totalEmails: number; zomatoOrders: number; swiggyOrders: number; otherOrders: number; recentEmails: Array<{ id: string; subject: string; from: string; date: string; body: string }> }>("/connectors/gmail"),
    gmailEmails: (days = 7) =>
      fetchApi<{ emails: Array<{ id: string; subject: string; from: string; date: string; body: string }> }>(`/connectors/gmail-emails?days=${days}`),
    drive: () =>
      fetchApi<{ files: Array<{ id: string; name: string; mimeType: string; modifiedTime: string }> }>("/connectors/drive"),
    billing: {
      list: () =>
        fetchApi<{ apps: Array<{ id: string; name: string; connected: boolean; connectedAt: string | null }> }>("/connectors/billing"),
      connect: (service: string, serviceName: string) =>
        fetchApi<{ success: boolean; service: string; connected: boolean }>("/connectors/billing", {
          method: "POST",
          body: JSON.stringify({ service, serviceName }),
        }),
      disconnect: (service: string) =>
        fetchApi<{ success: boolean; service: string; connected: boolean }>(`/connectors/billing?service=${service}`, {
          method: "DELETE",
        }),
    },
  },
}
