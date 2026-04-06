"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { getTemplate } from "@/lib/templates"
import { SpotifyTrack, formatDuration } from "@/lib/spotify"
import ClassTimeline from "@/components/ClassTimeline"
import SegmentPanel from "@/components/SegmentPanel"
import SavePlaylistModal from "@/components/SavePlaylistModal"

export default function ClassBuilderPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const template = getTemplate(templateId)

  // Map of segmentId → added tracks
  const [classTracks, setClassTracks] = useState<Record<string, SpotifyTrack[]>>({})
  const [activeSegmentId, setActiveSegmentId] = useState<string>("")
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)

  // Refs for scrolling to segment panels
  const segmentRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  useEffect(() => {
    if (template) {
      setActiveSegmentId(template.segments[0].id)
    }
  }, [template])

  if (status === "loading") return <LoadingScreen />
  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div className="text-center">
          <p className="text-white mb-4">Template not found.</p>
          <button onClick={() => router.push("/classes/new")} style={{ color: "#FF6B00" }}>
            ← Pick a template
          </button>
        </div>
      </div>
    )
  }

  function handleSegmentClick(segmentId: string) {
    setActiveSegmentId(segmentId)
    segmentRefs.current[segmentId]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleAddTrack(segmentId: string, track: SpotifyTrack) {
    setClassTracks((prev) => {
      const existing = prev[segmentId] ?? []
      if (existing.find((t) => t.id === track.id)) return prev
      return { ...prev, [segmentId]: [...existing, track] }
    })
  }

  function handleRemoveTrack(segmentId: string, trackId: string) {
    setClassTracks((prev) => ({
      ...prev,
      [segmentId]: (prev[segmentId] ?? []).filter((t) => t.id !== trackId),
    }))
  }

  const trackCounts = Object.fromEntries(
    template.segments.map((seg) => [seg.id, (classTracks[seg.id] ?? []).length])
  )

  const allTracks = template.segments.flatMap((seg) => classTracks[seg.id] ?? [])
  const totalTracks = allTracks.length
  const totalDurationMs = allTracks.reduce((sum, t) => sum + t.durationMs, 0)

  async function handleSavePlaylist(name: string) {
    const trackUris = allTracks.map((t) => t.uri)
    const description = `${template!.name} · Built with Spin`

    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, trackUris }),
      })
      const data = await res.json()
      if (!res.ok) return null
      return { url: data.url }
    } catch {
      return null
    }
  }

  return (
    <main className="min-h-screen pb-32" style={{ background: "#0A0A0A" }}>
      {/* Top nav */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-4"
        style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1A1A1A" }}
      >
        <button
          onClick={() => router.push("/classes/new")}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1A1A1A" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#888888">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white truncate">{template.name}</h1>
          <p className="text-xs" style={{ color: "#888888" }}>
            {totalTracks > 0
              ? `${totalTracks} tracks · ${formatDuration(totalDurationMs)}`
              : "No tracks yet"}
          </p>
        </div>
        {totalTracks > 0 && (
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#FF6B00" }}
          >
            Save
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* Timeline */}
        <ClassTimeline
          template={template}
          activeSegmentId={activeSegmentId}
          trackCounts={trackCounts}
          onSegmentClick={handleSegmentClick}
        />

        {/* Segment panels */}
        {template.segments.map((seg) => (
          <div
            key={seg.id}
            ref={(el) => { segmentRefs.current[seg.id] = el }}
            onClick={() => setActiveSegmentId(seg.id)}
          >
            <SegmentPanel
              segment={seg}
              addedTracks={classTracks[seg.id] ?? []}
              activePreviewId={activePreviewId}
              onPreviewPlay={setActivePreviewId}
              onAddTrack={(track) => handleAddTrack(seg.id, track)}
              onRemoveTrack={(trackId) => handleRemoveTrack(seg.id, trackId)}
            />
          </div>
        ))}
      </div>

      {/* Floating save bar when tracks exist */}
      {totalTracks > 0 && (
        <div
          className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none"
        >
          <div
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl pointer-events-auto"
            style={{
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <div>
              <p className="text-sm font-semibold text-white">
                {totalTracks} track{totalTracks !== 1 ? "s" : ""}
              </p>
              <p className="text-xs" style={{ color: "#888888" }}>
                {formatDuration(totalDurationMs)}
              </p>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#FF6B00" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
              </svg>
              Save to Spotify
            </button>
          </div>
        </div>
      )}

      {/* Save modal */}
      {showSaveModal && (
        <SavePlaylistModal
          totalTracks={totalTracks}
          templateName={template.name}
          onSave={handleSavePlaylist}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </main>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: "#FF6B00", borderTopColor: "transparent" }}
      />
    </div>
  )
}
