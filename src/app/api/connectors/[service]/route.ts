import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { fetchGmailOrderSummary, fetchDriveFiles, getConnectedServices } from "@/lib/connectors"
import { prisma } from "@/lib/prisma"

export const billingAppsMeta = [
  { id: "zomato", name: "Zomato" },
  { id: "swiggy", name: "Swiggy" },
  { id: "petpooja", name: "Petpooja" },
  { id: "mylivepos", name: "MyLivePOS" },
  { id: "dotpe", name: "DotPe" },
  { id: "urbanpiper", name: "Urban Piper" },
  { id: "other", name: "Other POS" },
]

export async function GET(req: NextRequest, { params }: { params: { service: string } }) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { service } = params

    switch (service) {
      case "gmail": {
        const data = await fetchGmailOrderSummary(auth.userId)
        return NextResponse.json(data)
      }
      case "gmail-emails": {
        const { searchParams } = new URL(req.url)
        const days = parseInt(searchParams.get("days") || "7", 10)
        const { fetchGmailOrderEmails } = await import("@/lib/connectors")
        const emails = await fetchGmailOrderEmails(auth.userId, days)
        return NextResponse.json({ emails })
      }
      case "drive": {
        const files = await fetchDriveFiles(auth.userId)
        return NextResponse.json({ files })
      }
      case "status": {
        const googleServices = await getConnectedServices(auth.userId)
        const billingConns = await prisma.billingConnection.findMany({
          where: { userId: auth.userId, connected: true },
        })
        const billingServices = billingConns.map((c) => {
          const app = billingAppsMeta.find((a) => a.id === c.service)
          return {
            service: c.service,
            serviceName: app?.name || c.serviceName,
            connected: true,
            type: "billing",
            connectedAt: c.createdAt.toISOString(),
          }
        })
        return NextResponse.json({
          services: [
            ...googleServices.map((s) => ({ ...s, type: "google" })),
            ...billingServices,
          ],
        })
      }
      default:
        return NextResponse.json({ error: "Unknown service" }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch data"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
