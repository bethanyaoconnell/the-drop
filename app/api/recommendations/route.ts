import { auth } from "@/auth"
import { checkRecommendationsApi, getRecommendationsByProfile, searchTracks } from "@/lib/spotify"
import { isVibeQuery, vibeAudioProfile, vibeSearchTerms } from "@/lib/vibeMapping"
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
    // Vibe / mood query — e.g. "energetic and euphoric", "dark and driving"
    if (isVibeQuery(query)) {
      const recsAvailable = await checkRecommendationsApi(session.accessToken)

      if (recsAvailable) {
        const profile = vibeAudioProfile(query)
        const tracks = await getRecommendationsByProfile(session.accessToken, profile, 10)
        return NextResponse.json({ tracks, vibeMode: "recommendations" })
      }

      // Fall back to keyword-mapped search since Recommendations API is unavailable
      // (deprecated by Spotify for all apps created after Nov 27, 2024)
      const terms = vibeSearchTerms(query)
      const results = await Promise.all(terms.map((t) => searchTracks(t, session.accessToken!, 5)))
      const seen = new Set<string>()
      const tracks = results.flat().filter((t) => {
        if (seen.has(t.id)) return false
        seen.add(t.id)
        return true
      })
      return NextResponse.json({
        tracks: tracks.slice(0, 10),
        vibeMode: "keyword-fallback",
        notice: "Spotify's mood-recommendation API isn't available for this app, so this is matched by keyword instead.",
      })
    }

    if (artist) {
      const [generic, byArtist] = await Promise.all([
        searchTracks(query, session.accessToken, 6),
        searchTracks(`artist:"${artist}"`, session.accessToken, 4),
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
