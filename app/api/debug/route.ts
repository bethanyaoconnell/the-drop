import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "No session" })
  }

  // Check what Spotify says about this token
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
  const user = await res.json()

  return NextResponse.json({
    tokenPresent: !!session.accessToken,
    tokenPrefix: session.accessToken?.slice(0, 10) + "...",
    spotifyResponse: user,
    spotifyStatus: res.status,
  })
}
