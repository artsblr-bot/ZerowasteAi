import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { generateDonationQR } from "@/lib/qrcode"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { status, ngoId, volunteerId, driverId, foodSafe, safetyNotes } = body

    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: { ngo: true, foodBatch: { include: { dish: true } } },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (status) updateData.status = status
    if (ngoId) updateData.ngoId = ngoId
    if (volunteerId) updateData.volunteerId = volunteerId
    if (driverId) updateData.driverId = driverId
    if (foodSafe !== undefined) updateData.foodSafe = foodSafe
    if (safetyNotes) updateData.safetyNotes = safetyNotes

    if (status === "picked_up") {
      updateData.pickupTime = new Date().toISOString()
    }
    if (status === "delivered") {
      updateData.deliveryTime = new Date().toISOString()
    }

    let qrCode = donation.qrCode
    if (status === "matched" && !donation.qrCode) {
      qrCode = await generateDonationQR(
        donation.id,
        donation.ngo?.name || "NGO",
        donation.weightKg,
      )
      updateData.qrCode = qrCode
    }

    const updated = await prisma.donation.update({
      where: { id: params.id },
      data: updateData,
      include: {
        ngo: { select: { id: true, name: true } },
        foodBatch: { include: { dish: true } },
        volunteer: { select: { id: true, name: true } },
        driver: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ donation: updated, qrCode })
  } catch (err) {
    console.error("Donation update error:", err)
    return NextResponse.json({ error: "Failed to update donation" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        ngo: { select: { id: true, name: true, phone: true, address: true } },
        foodBatch: { include: { dish: true, branch: true } },
        volunteer: { select: { id: true, name: true, phone: true } },
        driver: { select: { id: true, name: true, phone: true } },
      },
    })

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json({ donation })
  } catch (err) {
    console.error("Donation get error:", err)
    return NextResponse.json({ error: "Failed to load donation" }, { status: 500 })
  }
}
