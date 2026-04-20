import { SpotifyTrack } from "./spotify"

export type SavedSegment = {
  id: string
  name: string
  durationMin: number
  tracks: SpotifyTrack[]
}

export type SavedPlaylist = {
  id: string
  name: string
  templateId: string
  templateName: string
  createdAt: string
  segments: SavedSegment[]
  totalTracks: number
  totalDurationMs: number
}

const KEY = "the_drop_playlists"

function load(): SavedPlaylist[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]")
  } catch {
    return []
  }
}

function persist(playlists: SavedPlaylist[]) {
  localStorage.setItem(KEY, JSON.stringify(playlists))
}

export function savePlaylist(playlist: Omit<SavedPlaylist, "id" | "createdAt">): SavedPlaylist {
  const saved: SavedPlaylist = {
    ...playlist,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  const all = load()
  persist([saved, ...all])
  return saved
}

export function getPlaylists(): SavedPlaylist[] {
  return load()
}

export function getPlaylist(id: string): SavedPlaylist | null {
  return load().find((p) => p.id === id) ?? null
}

export function deletePlaylist(id: string) {
  persist(load().filter((p) => p.id !== id))
}
