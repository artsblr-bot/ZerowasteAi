import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

const billingApps = [
  { id: "zomato", name: "Zomato" },
  { id: "swiggy", name: "Swiggy" },
  { id: "petpooja", name: "Petpooja" },
  { id: "mylivepos", name: "MyLivePOS" },
  { id: "dotpe", name: "DotPe" },
  { id: "urbanpiper", name: "Urban Piper" },
  { id: "other", name: "Other POS" },
]

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const connections = await prisma.billingConnection.findMany({
      where: { userId: auth.userId },
    })

    return NextResponse.json({
      apps: billingApps.map((app) => {
        const conn = connections.find((c) => c.service === app.id)
        return {
          ...app,
          connected: !!conn && conn.connected,
          connectedAt: conn?.createdAt?.toISOString() || null,
        }
      }),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch billing connections"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { service, serviceName } = await req.json()
    if (!service) {
      return NextResponse.json({ error: "Missing service" }, { status: 400 })
    }

    const app = billingApps.find((a) => a.id === service)
    if (!app) {
      return NextResponse.json({ error: "Unknown service" }, { status: 400 })
    }

    const existing = await prisma.billingConnection.findFirst({
      where: { userId: auth.userId, service },
    })

    if (existing) {
      await prisma.billingConnection.update({
        where: { id: existing.id },
        data: { connected: true },
      })
    } else {
      await prisma.billingConnection.create({
        data: {
          userId: auth.userId,
          service,
          serviceName: serviceName || app.name,
        },
      })
    }

    return NextResponse.json({ success: true, service, connected: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const service = searchParams.get("service")
    if (!service) {
      return NextResponse.json({ error: "Missing service" }, { status: 400 })
    }

    const existing = await prisma.billingConnection.findFirst({
      where: { userId: auth.userId, service },
    })

    if (existing) {
      await prisma.billingConnection.delete({ where: { id: existing.id } })
    }

    return NextResponse.json({ success: true, service, connected: false })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to disconnect"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
