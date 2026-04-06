import { auth } from "@/auth"
import {
  getSpotifyUser,
  createPlaylist,
  addTracksToPlaylist,
} from "@/lib/spotify"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, description, trackUris } = await req.json()

  if (!name || !Array.isArray(trackUris) || trackUris.length === 0) {
    return NextResponse.json({ error: "name and trackUris required" }, { status: 400 })
  }

  try {
    const user = await getSpotifyUser(session.accessToken)
    const playlistId = await createPlaylist(
      user.id,
      name,
      description ?? "Created with Spin Playlist Builder",
      session.accessToken
    )
    await addTracksToPlaylist(playlistId, trackUris, session.accessToken)

    return NextResponse.json({
      playlistId,
      url: `https://open.spotify.com/playlist/${playlistId}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Playlist creation error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
