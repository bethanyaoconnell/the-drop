export type SpotifyTrack = {
  id: string
  name: string
  artists: string[]
  album: string
  albumArt: string
  durationMs: number
  previewUrl: string | null
  uri: string
}

function formatTrack(raw: SpotifyApi.TrackObjectFull): SpotifyTrack {
  return {
    id: raw.id,
    name: raw.name,
    artists: raw.artists.map((a) => a.name),
    album: raw.album.name,
    albumArt: raw.album.images?.[1]?.url ?? raw.album.images?.[0]?.url ?? "",
    durationMs: raw.duration_ms,
    previewUrl: raw.preview_url ?? null,
    uri: raw.uri,
  }
}

export async function searchTracks(
  query: string,
  accessToken: string,
  limit = 10
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(limit),
    market: "US",
  })

  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Spotify search failed: ${res.status}`)
  }

  const data = await res.json()
  return (data.tracks?.items ?? []).map(formatTrack)
}

// Cached app-wide capability check — recommendations access doesn't vary per user,
// it's gated by when this app's Client ID was created. Avoids repeating a failing
// call on every vibe search.
let recommendationsAvailable: boolean | null = null

export async function checkRecommendationsApi(accessToken: string): Promise<boolean> {
  if (recommendationsAvailable !== null) return recommendationsAvailable
  try {
    const res = await fetch(
      "https://api.spotify.com/v1/recommendations?seed_genres=pop&limit=1",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    recommendationsAvailable = res.ok
  } catch {
    recommendationsAvailable = false
  }
  return recommendationsAvailable
}

export async function getRecommendationsByProfile(
  accessToken: string,
  profile: { energy?: [number, number]; valence?: [number, number]; tempo?: [number, number]; danceability?: [number, number] },
  limit = 10
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    seed_genres: "pop,dance,electronic",
    limit: String(limit),
    market: "US",
  })
  if (profile.energy) {
    params.set("min_energy", String(profile.energy[0]))
    params.set("max_energy", String(profile.energy[1]))
  }
  if (profile.valence) {
    params.set("min_valence", String(profile.valence[0]))
    params.set("max_valence", String(profile.valence[1]))
  }
  if (profile.tempo) {
    params.set("min_tempo", String(profile.tempo[0]))
    params.set("max_tempo", String(profile.tempo[1]))
  }
  if (profile.danceability) {
    params.set("min_danceability", String(profile.danceability[0]))
    params.set("max_danceability", String(profile.danceability[1]))
  }

  const res = await fetch(`https://api.spotify.com/v1/recommendations?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Recommendations failed: ${res.status}`)
  const data = await res.json()
  return (data.tracks ?? []).map(formatTrack)
}

export async function getTopArtists(
  accessToken: string,
  limit = 10
): Promise<{ id: string; name: string }[]> {
  const res = await fetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=${limit}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.items ?? []).map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }))
}

export async function getTopTracks(
  accessToken: string,
  limit = 30,
  timeRange: "short_term" | "medium_term" | "long_term" = "medium_term"
): Promise<SpotifyTrack[]> {
  const res = await fetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.items ?? []).map(formatTrack)
}

export async function getSpotifyUser(accessToken: string): Promise<{ id: string; displayName: string }> {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`User fetch error ${res.status}: ${JSON.stringify(data)}`)
  return { id: data.id, displayName: data.display_name }
}

export async function createPlaylist(
  userId: string,
  name: string,
  description: string,
  accessToken: string
): Promise<string> {
  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`Playlist error ${res.status}: ${JSON.stringify(data)}`)
  return data.id
}

export async function addTracksToPlaylist(
  playlistId: string,
  uris: string[],
  accessToken: string
): Promise<void> {
  // Spotify allows max 100 tracks per request
  const chunks: string[][] = []
  for (let i = 0; i < uris.length; i += 100) {
    chunks.push(uris.slice(i, i + 100))
  }

  for (const chunk of chunks) {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: chunk }),
    })

    if (!res.ok) throw new Error("Failed to add tracks to playlist")
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

// Spotify doesn't expose BPM in standard search results (audio-features API is deprecated
// for new apps). We display duration and let users use the 30-sec preview to judge tempo.
// This namespace trick gives us type hints without a full Spotify types package.
declare namespace SpotifyApi {
  interface TrackObjectFull {
    id: string
    name: string
    uri: string
    duration_ms: number
    preview_url: string | null
    artists: Array<{ name: string }>
    album: {
      name: string
      images: Array<{ url: string; width: number; height: number }>
    }
  }
}
