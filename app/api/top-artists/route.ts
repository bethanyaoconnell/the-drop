import { auth } from "@/auth"
import { getTopArtists } from "@/lib/spotify"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const artists = await getTopArtists(session.accessToken, 10)
  return NextResponse.json({ artists })
}
