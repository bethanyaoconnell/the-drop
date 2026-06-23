"use client"

import { useEffect, useState } from "react"
import { Segment } from "@/lib/templates"
import { SpotifyTrack, formatDuration } from "@/lib/spotify"
import TrackCard from "./TrackCard"

type Props = {
  segment: Segment
  addedTracks: SpotifyTrack[]
  activePreviewId: string | null
  topArtists: { id: string; name: string }[]
  yourTopTracks?: SpotifyTrack[]
  librarySeed?: number
  stickyTop?: number
  expandable?: boolean
  showBpm?: boolean
  showProgress?: boolean
  onPreviewPlay: (trackId: string) => void
  onAddTrack: (track: SpotifyTrack) => void
  onRemoveTrack: (trackId: string) => void
}

export default function SegmentPanel({
  segment,
  addedTracks,
  activePreviewId,
  topArtists,
  yourTopTracks = [],
  librarySeed = 0,
  stickyTop = 64,
  expandable = false,
  showBpm = true,
  showProgress = false,
  onPreviewPlay,
  onAddTrack,
  onRemoveTrack,
}: Props) {
  const [expanded, setExpanded] = useState(!expandable || addedTracks.length > 0)
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [queryIndex, setQueryIndex] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [searching, setSearching] = useState(false)
  const [searchNotice, setSearchNotice] = useState<string | null>(null)

  const [libraryPage, setLibraryPage] = useState(librarySeed)
  const LIBRARY_PAGE_SIZE = 5

  const addedIds = new Set(addedTracks.map((t) => t.id))

  const availableLibrary = yourTopTracks.filter((t) => !addedIds.has(t.id))
  const libraryStart = availableLibrary.length > 0 ? (libraryPage * LIBRARY_PAGE_SIZE) % availableLibrary.length : 0
  const libraryDisplay = availableLibrary.length > 0
    ? Array.from(
        { length: Math.min(LIBRARY_PAGE_SIZE, availableLibrary.length) },
        (_, i) => availableLibrary[(libraryStart + i) % availableLibrary.length]
      )
    : []

  function handleLibraryRefresh() {
    setLibraryPage((p) => p + 1)
  }

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed) {
      setSearchResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/recommendations?query=${encodeURIComponent(trimmed)}`)
        const data = await res.json()
        setSearchResults(data.tracks ?? [])
        setSearchNotice(data.notice ?? null)
      } catch {
        setSearchResults([])
        setSearchNotice(null)
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  function handleAddFromSearch(track: SpotifyTrack) {
    onAddTrack(track)
    setSearchQuery("")
    setSearchResults([])
    setSearchNotice(null)
  }

  async function fetchRecommendations(qIdx = queryIndex) {
    setLoading(true)
    try {
      const query = segment.searchQueries[qIdx % segment.searchQueries.length]
      const params = new URLSearchParams({ query })
      if (topArtists.length > 0) {
        params.set("artist", topArtists[qIdx % topArtists.length].name)
      }
      const res = await fetch(`/api/recommendations?${params}`)
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
      {(() => {
        const usedMs = addedTracks.reduce((s, t) => s + t.durationMs, 0)
        const usedMin = usedMs / 60000
        const targetMin = segment.durationMin
        const remainingMin = targetMin - usedMin
        const isOver = usedMin > targetMin
        const pct = Math.min(100, (usedMin / targetMin) * 100)

        return (
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              position: "sticky",
              top: stickyTop,
              zIndex: 5,
              borderLeft: `3px solid ${segment.color}`,
              background: "#1A1A1A",
              cursor: expandable ? "pointer" : "default",
            }}
            onClick={() => expandable && setExpanded((e) => !e)}
          >
            {expandable && (
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="#666666"
                className="shrink-0 transition-transform"
                style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                <path d="M9 6l6 6-6 6V6z" />
              </svg>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">{segment.name}</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium tabular-nums"
                  style={{ background: "#FF6B0022", color: "#FF6B00" }}
                >
                  {segment.durationMin} min
                </span>
                {expandable && addedTracks.length === 0 && (
                  <span className="text-xs" style={{ color: "#555555" }}>No songs yet</span>
                )}
              </div>
              {showBpm && (
                <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
                  {segment.bpmMin}–{segment.bpmMax} BPM target
                </p>
              )}
            </div>

            {showProgress ? (
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs tabular-nums" style={{ color: isOver ? "#ff9f43" : "#444444" }}>
                  {isOver
                    ? `${formatDuration(usedMs)} · over by ${remainingMin.toFixed(1).replace("-", "")}m`
                    : `${formatDuration(usedMs)} · ${remainingMin.toFixed(1)}m left`}
                </span>
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "#242424" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: isOver ? "#ff9f43" : segment.color }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-1 shrink-0">
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
            )}
          </div>
        )
      })()}

      {expanded && (
      <div className="p-4" style={{ background: "#111111" }}>
        {/* Search bar */}
        <div className="relative mb-4">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#666666" className="shrink-0">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a song or vibe…"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#666666]"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchNotice(null) }}
                className="shrink-0 transition-opacity hover:opacity-70"
                style={{ color: "#666666" }}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            )}
          </div>

          {searchQuery.trim() && (
            <div className="mt-3">
              {searching ? (
                <div className="flex justify-center py-3">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#FF6B00", borderTopColor: "transparent" }}
                  />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {searchNotice && (
                    <p className="text-xs px-1 mb-1" style={{ color: "#666666" }}>
                      {searchNotice}
                    </p>
                  )}
                  {searchResults.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isAdded={addedIds.has(track.id)}
                      activePreviewId={activePreviewId}
                      onPreviewPlay={onPreviewPlay}
                      onAdd={handleAddFromSearch}
                      onRemove={onRemoveTrack}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center py-3" style={{ color: "#555555" }}>
                  No results for &quot;{searchQuery.trim()}&quot;
                </p>
              )}
            </div>
          )}
        </div>

        {/* From your library — your actual Spotify top tracks, guaranteed to match your taste */}
        {libraryDisplay.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "#888888" }}>
                From your library
              </p>
              {availableLibrary.length > LIBRARY_PAGE_SIZE && (
                <button
                  onClick={handleLibraryRefresh}
                  className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: "#FF6B00" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                  </svg>
                  Refresh
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {libraryDisplay.map((track) => (
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
      )}
    </div>
  )
}
