"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SavedSegment, savePlaylist } from "@/lib/localPlaylists"

type Props = {
  totalTracks: number
  templateId: string
  templateName: string
  segments: SavedSegment[]
  totalDurationMs: number
  onClose: () => void
}

export default function SavePlaylistModal({
  totalTracks,
  templateId,
  templateName,
  segments,
  totalDurationMs,
  onClose,
}: Props) {
  const router = useRouter()
  const defaultName = `${templateName} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  const [name, setName] = useState(defaultName)
  const [saved, setSaved] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  function handleSave() {
    if (!name.trim()) return
    const result = savePlaylist({
      name: name.trim(),
      templateId,
      templateName,
      segments,
      totalTracks,
      totalDurationMs,
    })
    setSavedId(result.id)
    setSaved(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6"
        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
      >
        {saved ? (
          <div className="text-center py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#FF6B0022" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF6B00">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ride saved!</h2>
            <p className="text-sm mb-6" style={{ color: "#888888" }}>
              Find it anytime in My Rides.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push(`/my-rides/${savedId}`)}
                className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#FF6B00" }}
              >
                View ride
              </button>
              <button
                onClick={onClose}
                className="py-3 rounded-full font-medium text-sm"
                style={{ color: "#888888" }}
              >
                Keep building
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Save ride</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#242424", color: "#888888" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: "#888888" }}>
              {totalTracks} tracks · Saved to My Rides
            </p>

            <label className="block mb-4">
              <span className="text-xs font-medium uppercase tracking-widest block mb-2" style={{ color: "#888888" }}>
                Ride name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-1"
                style={{ background: "#242424", border: "1px solid #2A2A2A" }}
                placeholder="Name your ride…"
                maxLength={100}
                autoFocus
              />
            </label>

            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "#FF6B00" }}
            >
              Save ride
            </button>
          </>
        )}
      </div>
    </div>
  )
}
