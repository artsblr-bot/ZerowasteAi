import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"

export interface JwtPayload {
  userId: string
  orgId: string
  role: string
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function getAuthUser(req: NextRequest): JwtPayload | null {
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const fromHeader = verifyToken(authHeader.slice(7))
    if (fromHeader) return fromHeader
  }
  const cookieHeader = req.headers.get("cookie") || ""
  const token = cookieHeader
    .split("; ")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1]
  if (token) return verifyToken(token)
  return null
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
    secure: process.env.NODE_ENV === "production",
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}
