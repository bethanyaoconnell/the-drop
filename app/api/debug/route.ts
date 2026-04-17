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

  // Try creating a test playlist to see exact error
  let playlistTest = null
  if (user.id) {
    const playlistRes = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Debug test", public: false }),
    })
    playlistTest = {
      status: playlistRes.status,
      response: await playlistRes.json(),
    }
  }

  return NextResponse.json({
    tokenPresent: !!session.accessToken,
    tokenPrefix: session.accessToken?.slice(0, 10) + "...",
    grantedScopes: session.scope ?? "(not stored — sign out and back in to capture)",
    spotifyResponse: user,
    spotifyStatus: res.status,
    playlistCreationTest: playlistTest,
  })
}
