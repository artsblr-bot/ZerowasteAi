import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ngos = await prisma.nGO.findMany({
      where: { isVerified: true },
      select: {
        id: true,
        name: true,
        address: true,
        lat: true,
        lng: true,
        maxCapacityKg: true,
        currentStorageKg: true,
        storageType: true,
        serviceAreaRadiusKm: true,
        phone: true,
        contactPerson: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ ngos })
  } catch (err) {
    console.error("NGOs error:", err)
    return NextResponse.json({ error: "Failed to load NGOs" }, { status: 500 })
  }
}
