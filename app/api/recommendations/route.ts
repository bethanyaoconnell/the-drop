import { auth } from "@/auth"
import { searchTracks } from "@/lib/spotify"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const query = req.nextUrl.searchParams.get("query")
  const artist = req.nextUrl.searchParams.get("artist")
  if (!query) {
    return NextResponse.json({ error: "query param required" }, { status: 400 })
  }

  try {
    if (artist) {
      const [generic, byArtist] = await Promise.all([
        searchTracks(query, session.accessToken, 6),
        searchTracks(`artist:"${artist}" ${query}`, session.accessToken, 4),
      ])
      const seen = new Set<string>()
      const tracks = [...byArtist, ...generic].filter((t) => {
        if (seen.has(t.id)) return false
        seen.add(t.id)
        return true
      })
      return NextResponse.json({ tracks: tracks.slice(0, 10) })
    }

    const tracks = await searchTracks(query, session.accessToken, 10)
    return NextResponse.json({ tracks })
  } catch (err) {
    console.error("Recommendations error:", err)
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 })
  }
}
