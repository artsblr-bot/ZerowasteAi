import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth"
import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  phone: z.string().optional(),
  role: z.string().optional(),
  cuisineType: z.string().optional(),
  organizationName: z.string().min(1),
  organizationType: z.enum(["restaurant", "hotel", "catering", "ngo", "cloud_kitchen", "bakery", "cafe", "hostel"]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = await hashPassword(data.password)

    const org = await prisma.organization.create({
      data: {
        name: data.organizationName,
        type: data.organizationType,
        users: {
          create: {
            email: data.email,
            passwordHash,
            name: data.name,
            role: "org_admin",
          },
        },
        branches: data.organizationType !== "ngo"
          ? { create: { name: "Main Branch", address: "", cuisineType: data.cuisineType } }
          : undefined,
      },
      include: { users: true },
    })

    const token = createToken({
      userId: org.users[0].id,
      orgId: org.id,
      role: "org_admin",
    })

    const response = NextResponse.json({
      user: { id: org.users[0].id, email: data.email, name: data.name, phone: data.phone, role: "org_admin" },
    })

    setAuthCookie(response, token)

    return response
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    console.error("Register error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
