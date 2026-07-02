import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId, req.nextUrl.searchParams.get("branchId"))

    const items = await prisma.inventoryItem.findMany({
      where: { branchId },
      orderBy: { expiryDate: "asc" },
    })

    const lowStock = items.filter((i) => i.threshold && i.quantity <= i.threshold)
    const expiringToday = items.filter(
      (i) => i.expiryDate && i.expiryDate <= new Date(Date.now() + 86400000) && i.expiryDate >= new Date(),
    )

    return NextResponse.json({
      items,
      lowStock,
      expiringToday,
      totals: {
        count: items.length,
        lowStockCount: lowStock.length,
        expiringCount: expiringToday.length,
        totalValue: items.reduce((sum, i) => sum + (i.costPerUnit ?? 0) * i.quantity, 0),
      },
    })
  } catch (err) {
    console.error("Inventory error:", err)
    return NextResponse.json({ error: "Failed to load inventory" }, { status: 500 })
  }
}
