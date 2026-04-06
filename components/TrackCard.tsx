"use client"

import Image from "next/image"
import { SpotifyTrack, formatDuration } from "@/lib/spotify"
import AudioPreview from "./AudioPreview"

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
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-colors"
      style={{
        background: isAdded ? "#1E1500" : "#1A1A1A",
        border: `1px solid ${isAdded ? "#FF6B0044" : "#2A2A2A"}`,
      }}
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

      {/* Preview button */}
      <AudioPreview
        previewUrl={track.previewUrl}
        trackId={track.id}
        activeTrackId={activePreviewId}
        onPlay={onPreviewPlay}
      />

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
  )
}
