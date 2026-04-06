"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  previewUrl: string | null
  trackId: string
  activeTrackId: string | null
  onPlay: (trackId: string) => void
}

export default function AudioPreview({ previewUrl, trackId, activeTrackId, onPlay }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)
  const isPlaying = activeTrackId === trackId

  useEffect(() => {
    if (!previewUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(previewUrl)
      audioRef.current.addEventListener("timeupdate", () => {
        const a = audioRef.current!
        setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0)
      })
      audioRef.current.addEventListener("ended", () => {
        setProgress(0)
        onPlay("")
      })
    }
  }, [previewUrl, onPlay])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      audio.pause()
      audio.currentTime = 0
      setProgress(0)
    }
  }, [isPlaying])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  if (!previewUrl) {
    return (
      <button
        disabled
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#242424", color: "#444444" }}
        title="No preview available"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </button>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onPlay(isPlaying ? "" : trackId)
      }}
      className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-80"
      style={{ background: isPlaying ? "#FF6B00" : "#242424" }}
      title={isPlaying ? "Stop preview" : "Preview 30s"}
    >
      {isPlaying ? (
        <>
          {/* Circular progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 32 32"
          >
            <circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </>
      ) : (
        <svg width="10" height="12" viewBox="0 0 10 12" fill="#888888">
          <path d="M0 0l10 6-10 6z" />
        </svg>
      )}
    </button>
  )
}
