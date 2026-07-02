import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        organization: {
          include: { branches: { take: 1 } },
        },
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          type: user.organization.type,
        },
        branch: user.organization.branches[0]
          ? { id: user.organization.branches[0].id, name: user.organization.branches[0].name }
          : null,
      },
    })
  } catch (err) {
    console.error("Auth me error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
