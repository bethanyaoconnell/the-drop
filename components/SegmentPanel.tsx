"use client"

import { useState } from "react"
import { Segment } from "@/lib/templates"
import { SpotifyTrack } from "@/lib/spotify"
import TrackCard from "./TrackCard"

type Props = {
  segment: Segment
  addedTracks: SpotifyTrack[]
  activePreviewId: string | null
  onPreviewPlay: (trackId: string) => void
  onAddTrack: (track: SpotifyTrack) => void
  onRemoveTrack: (trackId: string) => void
}

export default function SegmentPanel({
  segment,
  addedTracks,
  activePreviewId,
  onPreviewPlay,
  onAddTrack,
  onRemoveTrack,
}: Props) {
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [queryIndex, setQueryIndex] = useState(0)

  const addedIds = new Set(addedTracks.map((t) => t.id))

  async function fetchRecommendations(qIdx = queryIndex) {
    setLoading(true)
    try {
      const query = segment.searchQueries[qIdx % segment.searchQueries.length]
      const res = await fetch(
        `/api/recommendations?query=${encodeURIComponent(query)}`
      )
      const data = await res.json()
      setRecommendations(data.tracks ?? [])
      setLoaded(true)
    } catch {
      console.error("Failed to fetch recommendations")
    } finally {
      setLoading(false)
    }
  }

  function handleRefresh() {
    const next = (queryIndex + 1) % segment.searchQueries.length
    setQueryIndex(next)
    fetchRecommendations(next)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid #2A2A2A" }}
    >
      {/* Segment header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderLeft: `3px solid ${segment.color}`, background: "#1A1A1A" }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{segment.name}</h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium tabular-nums"
              style={{ background: "#FF6B0022", color: "#FF6B00" }}
            >
              {segment.durationMin} min
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
            {segment.bpmMin}–{segment.bpmMax} BPM target
          </p>
        </div>

        {/* Energy bar */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs" style={{ color: "#444444" }}>energy</span>
          <div
            className="w-16 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#242424" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${segment.energy * 100}%`,
                background: segment.color,
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-4" style={{ background: "#111111" }}>
        {/* Added tracks */}
        {addedTracks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "#888888" }}>
              Added · {addedTracks.length} track{addedTracks.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-2">
              {addedTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isAdded
                  activePreviewId={activePreviewId}
                  onPreviewPlay={onPreviewPlay}
                  onAdd={onAddTrack}
                  onRemove={onRemoveTrack}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {loaded && recommendations.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#888888" }}>
                Suggestions
              </p>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: "#FF6B00" }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {recommendations.filter((t) => !addedIds.has(t.id)).map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isAdded={false}
                  activePreviewId={activePreviewId}
                  onPreviewPlay={onPreviewPlay}
                  onAdd={onAddTrack}
                  onRemove={onRemoveTrack}
                />
              ))}
            </div>
          </div>
        )}

        {/* Load button */}
        {!loaded && (
          <button
            onClick={() => fetchRecommendations()}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-[0.99]"
            style={{
              background: "#1A1A1A",
              color: "#FF6B00",
              border: "1px dashed #FF6B0055",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin inline-block"
                  style={{ borderColor: "#FF6B00", borderTopColor: "transparent" }}
                />
                Finding tracks…
              </span>
            ) : (
              `Get ${segment.name} suggestions`
            )}
          </button>
        )}

        {loaded && loading && (
          <div className="flex justify-center py-2">
            <span
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#FF6B00", borderTopColor: "transparent" }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
