import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"
import { resolveBranchId } from "@/lib/branch"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const branchId = await resolveBranchId(auth.orgId, req.nextUrl.searchParams.get("branchId"))

    const menus = await prisma.menu.findMany({
      where: { branchId, isActive: true },
      include: {
        dishes: {
          include: { ingredients: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ menus })
  } catch (err) {
    console.error("Menu error:", err)
    return NextResponse.json({ error: "Failed to load menu" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    if (body.type === "dish") {
      const dish = await prisma.dish.create({
        data: {
          name: body.name,
          category: body.category,
          unitWeight: body.unitWeight,
          avgPrice: body.avgPrice,
          prepTime: body.prepTime,
          isSignature: body.isSignature ?? false,
          menuId: body.menuId,
          ingredients: body.ingredients
            ? { create: body.ingredients }
            : undefined,
        },
        include: { ingredients: true },
      })
      return NextResponse.json({ dish })
    }

    if (body.type === "menu") {
      const menu = await prisma.menu.create({
        data: {
          name: body.name,
          branchId: body.branchId,
          isActive: true,
        },
      })
      return NextResponse.json({ menu })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (err) {
    console.error("Create menu error:", err)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
