import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req)
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { service, code } = await req.json()
    if (!code || !service) {
      return NextResponse.json({ error: "Missing code or service" }, { status: 400 })
    }

    const tokenUrl = "https://oauth2.googleapis.com/token"
    const body = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: "postmessage",
      grant_type: "authorization_code",
    })

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error("Token exchange failed:", errText)
      return NextResponse.json({ error: "Token exchange failed" }, { status: 502 })
    }

    const tokens = await tokenRes.json()

    console.log(`Connected ${service} for user ${auth.userId} (scope: ${tokens.scope})`)

    return NextResponse.json({
      success: true,
      service,
      scope: tokens.scope,
    })
  } catch (error) {
    console.error("Google connect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
