"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getPlaylist, SavedPlaylist } from "@/lib/localPlaylists"
import { formatDuration } from "@/lib/spotify"

export default function SavedRidePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [playlist, setPlaylist] = useState<SavedPlaylist | null>(null)
  const [queueState, setQueueState] = useState<"idle" | "loading" | "done" | "error">("idle")

  useEffect(() => {
    setPlaylist(getPlaylist(id))
  }, [id])

  async function handleQueue() {
    if (!playlist) return
    const trackUris = playlist.segments.flatMap((seg) => seg.tracks.map((t) => t.uri))
    if (trackUris.length === 0) return
    setQueueState("loading")
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris }),
      })
      setQueueState(res.ok ? "done" : "error")
    } catch {
      setQueueState("error")
    }
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="text-center">
          <p className="text-white mb-4">Ride not found.</p>
          <button onClick={() => router.push("/my-rides")} style={{ color: "#FF6B00" }}>
            ← My Rides
          </button>
        </div>
      </div>
    )
  }

  const allTrackLines = playlist.segments.flatMap((seg) =>
    seg.tracks.map((t) => `${t.name} — ${t.artists.join(", ")}`)
  )

  function copyTrackList() {
    navigator.clipboard.writeText(allTrackLines.join("\n"))
  }

  return (
    <main className="min-h-screen pb-16" style={{ background: "#0A0A0A" }}>
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-4"
        style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1A1A1A" }}
      >
        <button
          onClick={() => router.push("/my-rides")}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1A1A1A" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#888888">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white truncate">{playlist.name}</h1>
          <p className="text-xs" style={{ color: "#888888" }}>
            {playlist.totalTracks} tracks · {formatDuration(playlist.totalDurationMs)}
          </p>
        </div>
        <button
          onClick={copyTrackList}
          className="px-4 py-2 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888888" }}
        >
          Copy list
        </button>
        <button
          onClick={handleQueue}
          disabled={queueState === "loading" || queueState === "done"}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "#1DB954" }}
        >
          {queueState === "loading" ? "Queuing…" : queueState === "done" ? "✓ Queued!" : queueState === "error" ? "Error — retry" : "Queue in Spotify"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {playlist.segments.map((seg) => (
          <div key={seg.id}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#888888" }}>
                {seg.name}
              </span>
              <span className="text-xs" style={{ color: "#555555" }}>
                {seg.durationMin}m
              </span>
            </div>
            {seg.tracks.length === 0 ? (
              <p className="text-sm px-1" style={{ color: "#555555" }}>No tracks added</p>
            ) : (
              <div className="space-y-2">
                {seg.tracks.map((track, i) => (
                  <div
                    key={`${track.id}-${i}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "#1A1A1A" }}
                  >
                    {track.albumArt && (
                      <img
                        src={track.albumArt}
                        alt={track.album}
                        className="w-10 h-10 rounded-lg shrink-0 object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{track.name}</p>
                      <p className="text-xs truncate" style={{ color: "#888888" }}>
                        {track.artists.join(", ")}
                      </p>
                    </div>
                    <span className="text-xs ml-auto shrink-0" style={{ color: "#555555" }}>
                      {formatDuration(track.durationMs)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
