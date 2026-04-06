"use client"

import { useState } from "react"

type Props = {
  totalTracks: number
  templateName: string
  onSave: (name: string) => Promise<{ url: string } | null>
  onClose: () => void
}

export default function SavePlaylistModal({ totalTracks, templateName, onSave, onClose }: Props) {
  const defaultName = `${templateName} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  const [name, setName] = useState(defaultName)
  const [saving, setSaving] = useState(false)
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const result = await onSave(name.trim())
      if (result) {
        setSavedUrl(result.url)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save playlist.")
    } finally {
      setSaving(false)
    }
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
        {savedUrl ? (
          /* Success state */
          <div className="text-center py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#FF6B0022" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF6B00">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Saved to Spotify</h2>
            <p className="text-sm mb-6" style={{ color: "#888888" }}>
              Your playlist is ready. Open it in Spotify to start listening.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#FF6B00" }}
              >
                <SpotifyIcon />
                Open in Spotify
              </a>
              <button
                onClick={onClose}
                className="py-3 rounded-full font-medium text-sm"
                style={{ color: "#888888" }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Save form */
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Save to Spotify</h2>
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

            <div className="mb-2">
              <p className="text-sm mb-4" style={{ color: "#888888" }}>
                {totalTracks} tracks · Saved as private playlist
              </p>
            </div>

            <label className="block mb-4">
              <span className="text-xs font-medium uppercase tracking-widest block mb-2" style={{ color: "#888888" }}>
                Playlist name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none focus:ring-1"
                style={{
                  background: "#242424",
                  border: "1px solid #2A2A2A",
                  // @ts-ignore
                  "--tw-ring-color": "#FF6B00",
                }}
                placeholder="Name your playlist…"
                maxLength={100}
                autoFocus
              />
            </label>

            {error && (
              <p className="text-sm mb-4 text-red-400">{error}</p>
            )}

            <button
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="w-full py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "#FF6B00" }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin inline-block"
                    style={{ borderColor: "white", borderTopColor: "transparent" }}
                  />
                  Saving…
                </span>
              ) : (
                "Save Playlist"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function SpotifyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}
