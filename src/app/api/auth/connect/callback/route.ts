import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, createToken, setAuthCookie } from "@/lib/auth"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""

async function exchangeCode(code: string, origin: string) {
  const body = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: `${origin}/api/auth/connect/callback`,
    grant_type: "authorization_code",
  })

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error("Token exchange failed:", errText)
    return null
  }

  return res.json()
}

async function getGoogleUser(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state") || "gmail"
    const errorParam = searchParams.get("error")

    if (errorParam || !code) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const origin = new URL(req.url).origin
    const tokens = await exchangeCode(code, origin)
    if (!tokens) {
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", req.url))
    }

    const googleUser = await getGoogleUser(tokens.access_token)
    if (!googleUser || !googleUser.email) {
      return NextResponse.redirect(new URL("/login?error=invalid_user", req.url))
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    })

    if (existingUser) {
      const jwtToken = createToken({
        userId: existingUser.id,
        orgId: existingUser.organizationId,
        role: existingUser.role,
      })

      // Store OAuth tokens only for connection flows (not sign-in)
      if (state !== "signin") {
        const conn = await prisma.googleConnection.findFirst({
          where: { userId: existingUser.id, service: state },
        })
        if (conn) {
          await prisma.googleConnection.update({
            where: { id: conn.id },
            data: {
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token || undefined,
              scope: tokens.scope,
              expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
            },
          })
        } else {
          await prisma.googleConnection.create({
            data: {
              userId: existingUser.id,
              service: state,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token || undefined,
              scope: tokens.scope,
              expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
            },
          })
        }

        // Connection flow: redirect back to connect page with success flag
        const response = NextResponse.redirect(new URL(`/setup/connect?connected=${state}`, req.url))
        setAuthCookie(response, jwtToken)
        return response
      }

      // Sign-in flow: go to app
      const response = NextResponse.redirect(new URL("/app", req.url))
      setAuthCookie(response, jwtToken)
      return response
    }

    // New user — create account + org + branch
    const org = await prisma.organization.create({
      data: {
        name: `${googleUser.name}'s Restaurant`,
        type: "restaurant",
      },
    })

    const branch = await prisma.branch.create({
      data: {
        name: "Main Branch",
        organizationId: org.id,
      },
    })

    const user = await prisma.user.create({
      data: {
        email: googleUser.email,
        passwordHash: "",
        name: googleUser.name || googleUser.email.split("@")[0],
        role: "owner",
        organizationId: org.id,
      },
    })

    // Store connection tokens only for non-signin flows
    if (state !== "signin") {
      await prisma.googleConnection.create({
        data: {
          userId: user.id,
          service: state,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || undefined,
          scope: tokens.scope,
          expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        },
      })
    }

    const jwtToken = createToken({
      userId: user.id,
      orgId: org.id,
      role: "owner",
    })
    const response = NextResponse.redirect(new URL("/setup/connect", req.url))
    setAuthCookie(response, jwtToken)

    return response
  } catch (error) {
    console.error("Callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_failed", req.url))
  }
}
