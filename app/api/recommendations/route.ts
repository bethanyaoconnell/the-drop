import { auth } from "@/auth"
import { searchTracks } from "@/lib/spotify"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const query = req.nextUrl.searchParams.get("query")
  if (!query) {
    return NextResponse.json({ error: "query param required" }, { status: 400 })
  }

  try {
    const tracks = await searchTracks(query, session.accessToken, 10)
    return NextResponse.json({ tracks })
  } catch (err) {
    console.error("Recommendations error:", err)
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 })
  }
}
