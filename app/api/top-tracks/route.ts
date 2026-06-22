import { auth } from "@/auth"
import { getTopTracks } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tracks = await getTopTracks(session.accessToken, 30)
  return NextResponse.json({ tracks })
}
