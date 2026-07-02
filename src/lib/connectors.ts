import { prisma } from "./prisma"

function isTokenExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return true
  return new Date() >= expiresAt
}

function decodeBase64(data: string): string {
  try {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
  } catch {
    return data
  }
}

async function getGoogleToken(userId: string, service: string) {
  const conn = await prisma.googleConnection.findFirst({
    where: { userId, service },
  })
  if (!conn) return null
  if (isTokenExpired(conn.expiresAt) && conn.refreshToken) {
    try {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          refresh_token: conn.refreshToken,
          grant_type: "refresh_token",
        }).toString(),
      })
      if (!res.ok) return null
      const data = await res.json()
      await prisma.googleConnection.update({
        where: { id: conn.id },
        data: {
          accessToken: data.access_token,
          expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
        },
      })
      return data.access_token
    } catch {
      return null
    }
  }
  return conn.accessToken
}

async function gmailFetch(userId: string, path: string, params?: Record<string, string>) {
  const token = await getGoogleToken(userId, "gmail")
  if (!token) throw new Error("Gmail not connected")
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Gmail API error: ${res.status}`)
  return res.json()
}

async function driveFetch(userId: string, path: string, params?: Record<string, string>) {
  const token = await getGoogleToken(userId, "drive")
  if (!token) throw new Error("Drive not connected")
  const url = new URL(`https://www.googleapis.com/drive/v3/${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Drive API error: ${res.status}`)
  return res.json()
}

export async function fetchGmailOrderEmails(userId: string, daysBack = 7) {
  const date = new Date()
  date.setDate(date.getDate() - daysBack)
  const query = `after:${Math.floor(date.getTime() / 1000)} (order OR ordered OR confirmation OR "order placed" OR "order confirmed" OR Zomato OR Swiggy)`
  const list = await gmailFetch(userId, "messages", { q: query, maxResults: "20" })
  if (!list.messages?.length) return []

  const emails = []
  for (const msg of list.messages.slice(0, 10)) {
    try {
      const detail = await gmailFetch(userId, `messages/${msg.id}`, { format: "full" })
      const headers = detail.payload?.headers || []
      const subject = headers.find((h: any) => h.name === "Subject")?.value || ""
      const from = headers.find((h: any) => h.name === "From")?.value || ""
      const dateHeader = headers.find((h: any) => h.name === "Date")?.value || ""

      let body = ""
      const parts = detail.payload?.parts || [detail.payload]
      for (const part of parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body = decodeBase64(part.body.data)
          break
        }
        if (part.mimeType === "text/html" && part.body?.data && !body) {
          body = decodeBase64(part.body.data)
        }
        if (part.parts) {
          for (const sub of part.parts) {
            if (sub.mimeType === "text/plain" && sub.body?.data) {
              body = decodeBase64(sub.body.data)
              break
            }
          }
        }
      }

      emails.push({
        id: msg.id,
        subject,
        from,
        date: dateHeader,
        body: body.substring(0, 2000),
      })
    } catch {
      // skip failed messages
    }
  }
  return emails
}

export async function fetchGmailOrderSummary(userId: string, daysBack = 7) {
  const emails = await fetchGmailOrderEmails(userId, daysBack)
  const zomato = emails.filter((e) => e.from.toLowerCase().includes("zomato"))
  const swiggy = emails.filter((e) => e.from.toLowerCase().includes("swiggy"))
  return {
    totalEmails: emails.length,
    zomatoOrders: zomato.length,
    swiggyOrders: swiggy.length,
    otherOrders: emails.length - zomato.length - swiggy.length,
    recentEmails: emails.slice(0, 5),
  }
}

export async function fetchDriveFiles(userId: string, pageSize = 20) {
  const files = await driveFetch(userId, "files", {
    pageSize: String(pageSize),
    orderBy: "modifiedTime desc",
    q: "mimeType='text/csv' or mimeType contains 'spreadsheet' or mimeType contains 'pdf' or mimeType='application/vnd.google-apps.spreadsheet'",
  })
  return files.files?.map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    modifiedTime: f.modifiedTime,
    size: f.size,
    webViewLink: f.webViewLink,
  })) || []
}

export async function fetchDriveSheets(userId: string) {
  const files = await driveFetch(userId, "files", {
    pageSize: "10",
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    orderBy: "modifiedTime desc",
  })
  return files.files?.map((f: any) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
  })) || []
}

export async function getConnectedServices(userId: string) {
  const connections = await prisma.googleConnection.findMany({ where: { userId } })
  return connections.map((c) => ({
    service: c.service,
    connected: true,
    scope: c.scope,
    expiresAt: c.expiresAt?.toISOString() || null,
  }))
}
