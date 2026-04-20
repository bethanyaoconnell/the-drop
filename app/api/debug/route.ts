import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "No session" })
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID ?? ""

  // Check what Spotify says about this token
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })
  const user = await res.json()

  // Try creating a PUBLIC playlist (some accounts have private-playlist quirks)
  let publicPlaylistTest = null
  let privatePlaylistTest = null
  let followTest = null

  if (user.id) {
    const pubRes = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Debug public test", public: true }),
    })
    publicPlaylistTest = { status: pubRes.status, response: await pubRes.json() }

    const privRes = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Debug private test", public: false }),
    })
    privatePlaylistTest = { status: privRes.status, response: await privRes.json() }

    // Try a different write: follow Spotify's own playlist
    const followRes = await fetch(
      "https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M/followers",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public: false }),
      },
    )
    followTest = {
      status: followRes.status,
      response: followRes.status === 200 ? "OK" : await followRes.text(),
    }
  }

  return NextResponse.json({
    clientIdPrefix: clientId.slice(0, 8) + "..." + clientId.slice(-4),
    clientIdLength: clientId.length,
    tokenPresent: !!session.accessToken,
    tokenPrefix: session.accessToken?.slice(0, 10) + "...",
    grantedScopes: session.scope ?? "(not stored — sign out and back in to capture)",
    spotifyUserId: user.id,
    spotifyUserEmail: user.email,
    spotifyResponse: user,
    spotifyStatus: res.status,
    publicPlaylistTest,
    privatePlaylistTest,
    followPlaylistTest: followTest,
  })
}
