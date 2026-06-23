"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { SpotifyTrack, formatDuration } from "@/lib/spotify"
import AudioPreview from "./AudioPreview"
import EmbedAudioPreview from "./EmbedAudioPreview"

type Props = {
  track: SpotifyTrack
  isAdded: boolean
  activePreviewId: string | null
  onPreviewPlay: (trackId: string) => void
  onAdd: (track: SpotifyTrack) => void
  onRemove: (trackId: string) => void
}

export default function TrackCard({
  track,
  isAdded,
  activePreviewId,
  onPreviewPlay,
  onAdd,
  onRemove,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function toggleMenu(e: React.MouseEvent) {
    e.stopPropagation()
    if (!menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 6, left: rect.right - 160 })
    }
    setMenuOpen((o) => !o)
  }

  return (
    <div
      className="rounded-xl"
      style={{ border: `1px solid ${isAdded ? "#FF6B0044" : "#2A2A2A"}` }}
    >
      <div
        className="flex items-center gap-3 p-3 rounded-xl transition-colors"
        style={{ background: isAdded ? "#1E1500" : "#1A1A1A" }}
      >
        {/* Album art */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-elevated">
          {track.albumArt ? (
            <Image
              src={track.albumArt}
              alt={track.album}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: "#242424" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#444444">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{track.name}</p>
          <p className="text-xs truncate" style={{ color: "#888888" }}>
            {track.artists.join(", ")}
          </p>
        </div>

        {/* Duration */}
        <span className="text-xs shrink-0 tabular-nums" style={{ color: "#444444" }}>
          {formatDuration(track.durationMs)}
        </span>

        {/* 3-dot menu */}
        <div className="relative shrink-0">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: "#242424" }}
            aria-label="More options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#888888">
              <circle cx="5" cy="12" r="2.2" />
              <circle cx="12" cy="12" r="2.2" />
              <circle cx="19" cy="12" r="2.2" />
            </svg>
          </button>
        </div>

        {menuOpen && typeof document !== "undefined" && createPortal(
          <div
            ref={menuRef}
            className="fixed rounded-xl overflow-hidden min-w-[160px] z-50"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              background: "#1A1A1A",
              border: "1px solid #2A2A2A",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            <a
              href={`https://open.spotify.com/track/${track.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="block w-full px-4 py-3 text-sm text-left text-white hover:opacity-70 transition-opacity"
            >
              Open in Spotify
            </a>
          </div>,
          document.body
        )}

        {/* Preview button — inline 30s clip if available, else hidden Spotify embed player */}
        {track.previewUrl ? (
          <AudioPreview
            previewUrl={track.previewUrl}
            trackId={track.id}
            activeTrackId={activePreviewId}
            onPlay={onPreviewPlay}
          />
        ) : (
          <EmbedAudioPreview
            trackId={track.id}
            activeTrackId={activePreviewId}
            onPlay={onPreviewPlay}
          />
        )}

        {/* Add / remove button */}
        <button
          onClick={() => (isAdded ? onRemove(track.id) : onAdd(track))}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all hover:opacity-80 active:scale-95"
          style={{
            background: isAdded ? "#FF6B0022" : "#FF6B00",
            color: isAdded ? "#FF6B00" : "#FFFFFF",
            border: isAdded ? "1px solid #FF6B0055" : "none",
          }}
          title={isAdded ? "Remove from class" : "Add to class"}
        >
          {isAdded ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
