import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const { trackUris } = await req.json()
  if (!Array.isArray(trackUris) || trackUris.length === 0) {
    return NextResponse.json({ error: "No tracks provided" }, { status: 400 })
  }

  let queued = 0
  for (const uri of trackUris) {
    const res = await fetch(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(uri)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    )
    if (res.ok) queued++
    else {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: `Failed on track ${queued + 1}`, details: err, queued },
        { status: res.status }
      )
    }
  }

  return NextResponse.json({ queued })
}
