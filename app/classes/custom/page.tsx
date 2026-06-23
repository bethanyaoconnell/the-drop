"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CustomSection,
  CUSTOM_COLORS,
  buildCustomTemplate,
  loadDraftStructure,
  newSection,
} from "@/lib/customStructure"
import { SpotifyTrack, formatDuration } from "@/lib/spotify"
import { useActiveSection } from "@/lib/useActiveSection"
import ClassTimeline from "@/components/ClassTimeline"
import SegmentPanel from "@/components/SegmentPanel"
import SavePlaylistModal from "@/components/SavePlaylistModal"

export default function CustomClassBuilderPage() {
  const { status } = useSession()
  const router = useRouter()

  const [name, setName] = useState("")
  const [sections, setSections] = useState<CustomSection[] | null>(null)
  const [classTracks, setClassTracks] = useState<Record<string, SpotifyTrack[]>>({})
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [editingStructure, setEditingStructure] = useState(false)
  const [topArtists, setTopArtists] = useState<{ id: string; name: string }[]>([])
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([])

  const segmentIds = sections?.map((s) => s.id) ?? []
  const { activeId: activeSegmentId, setRef, scrollTo } = useActiveSection(segmentIds)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  useEffect(() => {
    const draft = loadDraftStructure()
    if (!draft || draft.sections.length === 0) {
      router.push("/classes/new")
      return
    }
    setName(draft.name)
    setSections(draft.sections)
  }, [router])

  useEffect(() => {
    fetch("/api/top-artists")
      .then((res) => res.json())
      .then((data) => setTopArtists(data.artists ?? []))
      .catch(() => setTopArtists([]))

    fetch("/api/top-tracks")
      .then((res) => res.json())
      .then((data) => setTopTracks(data.tracks ?? []))
      .catch(() => setTopTracks([]))
  }, [])

  if (status === "loading" || !sections) return <LoadingScreen />

  const template = buildCustomTemplate(name, sections)
  const totalTargetMin = sections.reduce((s, sec) => s + sec.durationMin, 0)

  function handleAddTrack(sectionId: string, track: SpotifyTrack) {
    setClassTracks((prev) => {
      const existing = prev[sectionId] ?? []
      if (existing.find((t) => t.id === track.id)) return prev
      return { ...prev, [sectionId]: [...existing, track] }
    })
  }

  function handleRemoveTrack(sectionId: string, trackId: string) {
    setClassTracks((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] ?? []).filter((t) => t.id !== trackId),
    }))
  }

  function updateSection(id: string, patch: Partial<CustomSection>) {
    setSections((prev) => prev!.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeSection(id: string) {
    setSections((prev) => prev!.filter((s) => s.id !== id))
    setClassTracks((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function moveSection(id: string, dir: -1 | 1) {
    setSections((prev) => {
      const arr = [...prev!]
      const idx = arr.findIndex((s) => s.id === id)
      const swapIdx = idx + dir
      if (swapIdx < 0 || swapIdx >= arr.length) return prev
      ;[arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]]
      return arr
    })
  }

  function addSection() {
    setSections((prev) => [...prev!, newSection("", 5)])
  }

  const trackCounts = Object.fromEntries(
    sections.map((sec) => [sec.id, (classTracks[sec.id] ?? []).length])
  )

  const allTracks = sections.flatMap((sec) => classTracks[sec.id] ?? [])
  const totalTracks = allTracks.length
  const totalDurationMs = allTracks.reduce((sum, t) => sum + t.durationMs, 0)
  const overTarget = totalDurationMs / 60000 > totalTargetMin

  const savedSegments = sections.map((sec) => ({
    id: sec.id,
    name: sec.name || "Section",
    durationMin: sec.durationMin,
    tracks: classTracks[sec.id] ?? [],
  }))

  const activeSegment = template.segments.find((s) => s.id === activeSegmentId)
  const activeUsedMs = (classTracks[activeSegmentId] ?? []).reduce((s, t) => s + t.durationMs, 0)
  const activeRemainingMin = activeSegment ? activeSegment.durationMin - activeUsedMs / 60000 : 0

  return (
    <main className="min-h-screen pb-32" style={{ background: "#0A0A0A" }}>
      {/* Top nav + active section indicator, stacked in one sticky container */}
      <div
        className="sticky top-0 z-10"
        style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1A1A1A" }}
      >
        <div className="flex items-center gap-4 pl-4 pr-16 py-3">
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
            <h1 className="text-base font-bold text-white truncate">{name || "My Custom Ride"}</h1>
            <p className="text-xs" style={{ color: overTarget ? "#ff9f43" : "#888888" }}>
              {totalTracks > 0
                ? `${totalTracks} tracks · ${formatDuration(totalDurationMs)} / ${totalTargetMin}m target`
                : `No tracks yet · ${totalTargetMin}m target`}
            </p>
          </div>
          <button
            onClick={() => setEditingStructure((e) => !e)}
            className="px-3 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-90 shrink-0"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888888" }}
          >
            {editingStructure ? "Done editing" : "Edit structure"}
          </button>
          {totalTracks > 0 && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
              style={{ background: "#FF6B00" }}
            >
              Save
            </button>
          )}
        </div>

        {/* Condensed active-section indicator */}
        {activeSegment && (
          <div
            className="flex items-center justify-between gap-3 pl-4 pr-16 py-1.5"
            style={{ borderTop: "1px solid #1A1A1A" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: activeSegment.color }} />
              <span className="text-xs font-semibold text-white truncate">{activeSegment.name}</span>
              <span className="text-xs shrink-0" style={{ color: "#555555" }}>
                {activeSegment.durationMin}m target
              </span>
            </div>
            <span
              className="text-xs shrink-0 tabular-nums"
              style={{ color: activeRemainingMin < 0 ? "#ff9f43" : "#666666" }}
            >
              {activeRemainingMin >= 0
                ? `${activeRemainingMin.toFixed(1)}m left`
                : `${Math.abs(activeRemainingMin).toFixed(1)}m over`}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* Edit structure panel */}
        {editingStructure && (
          <div className="rounded-2xl p-4" style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: "#888888" }}>
              Sections
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {sections.map((sec, i) => (
                <div key={sec.id} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "#111111" }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CUSTOM_COLORS[i % CUSTOM_COLORS.length] }} />
                  <input
                    type="text"
                    value={sec.name}
                    onChange={(e) => updateSection(sec.id, { name: e.target.value })}
                    placeholder={`Section ${i + 1}`}
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-[#555555]"
                  />
                  <input
                    type="number"
                    min={1}
                    value={sec.durationMin}
                    onChange={(e) => updateSection(sec.id, { durationMin: Number(e.target.value) || 0 })}
                    className="w-14 px-2 py-1 rounded-lg text-xs text-white text-right outline-none tabular-nums"
                    style={{ background: "#242424", border: "1px solid #2A2A2A" }}
                  />
                  <span className="text-xs" style={{ color: "#666666" }}>min</span>
                  <button onClick={() => moveSection(sec.id, -1)} disabled={i === 0} className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30" style={{ background: "#242424", color: "#888888" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z" /></svg>
                  </button>
                  <button onClick={() => moveSection(sec.id, 1)} disabled={i === sections.length - 1} className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30" style={{ background: "#242424", color: "#888888" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                  </button>
                  <button onClick={() => removeSection(sec.id)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#242424", color: "#888888" }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addSection}
              className="w-full py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-80"
              style={{ background: "#111111", color: "#FF6B00", border: "1px dashed #FF6B0055" }}
            >
              + Add section
            </button>
          </div>
        )}

        {/* Timeline */}
        <ClassTimeline
          template={template}
          activeSegmentId={activeSegmentId}
          trackCounts={trackCounts}
          onSegmentClick={scrollTo}
        />

        {/* Section panels */}
        {template.segments.map((seg, i) => (
          <div
            key={seg.id}
            ref={setRef(seg.id)}
            data-section-id={seg.id}
            onClick={() => scrollTo(seg.id)}
          >
            <SegmentPanel
              segment={seg}
              addedTracks={classTracks[seg.id] ?? []}
              activePreviewId={activePreviewId}
              topArtists={topArtists}
              yourTopTracks={topTracks}
              librarySeed={i}
              expandable
              showBpm={false}
              showProgress
              onPreviewPlay={setActivePreviewId}
              onAddTrack={(track) => handleAddTrack(seg.id, track)}
              onRemoveTrack={(trackId) => handleRemoveTrack(seg.id, trackId)}
            />
          </div>
        ))}
      </div>

      {/* Floating save bar */}
      {totalTracks > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
          <div
            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl pointer-events-auto"
            style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
          >
            <div>
              <p className="text-sm font-semibold text-white">
                {totalTracks} track{totalTracks !== 1 ? "s" : ""}
              </p>
              <p className="text-xs" style={{ color: overTarget ? "#ff9f43" : "#888888" }}>
                {formatDuration(totalDurationMs)} / {totalTargetMin}m
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
              Save ride
            </button>
          </div>
        </div>
      )}

      {showSaveModal && (
        <SavePlaylistModal
          totalTracks={totalTracks}
          templateId="custom"
          templateName={name || "My Custom Ride"}
          segments={savedSegments}
          totalDurationMs={totalDurationMs}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </main>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
      <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#FF6B00", borderTopColor: "transparent" }} />
    </div>
  )
}
