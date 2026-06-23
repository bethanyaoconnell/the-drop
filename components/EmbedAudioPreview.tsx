"use client"

import { useEffect, useRef, useState } from "react"
import { getSpotifyIframeApi, SpotifyEmbedController } from "@/lib/spotifyEmbedApi"

type Props = {
  trackId: string
  activeTrackId: string | null
  onPlay: (trackId: string) => void
}

export default function EmbedAudioPreview({ trackId, activeTrackId, onPlay }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const readyPromiseRef = useRef<Promise<SpotifyEmbedController> | null>(null)
  const awaitingStartRef = useRef(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(false)
  const isPlaying = activeTrackId === trackId

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      controllerRef.current?.pause()
    }
  }, [isPlaying])

  // Creating the controller only instantiates the JS wrapper — the underlying
  // iframe still needs to finish loading before it'll actually respond to
  // play commands. Wait for the "ready" event (with a timeout fallback in
  // case this API version doesn't emit it) before resolving.
  function ensureController(): Promise<SpotifyEmbedController> {
    if (readyPromiseRef.current) return readyPromiseRef.current

    readyPromiseRef.current = new Promise((resolve, reject) => {
      if (!containerRef.current) return reject(new Error("no container"))
      getSpotifyIframeApi()
        .then((IFrameAPI) => {
          IFrameAPI.createController(
            containerRef.current!,
            { uri: `spotify:track:${trackId}`, width: 1, height: 1 },
            (controller) => {
              controllerRef.current = controller
              let resolved = false
              const finish = () => {
                if (resolved) return
                resolved = true
                resolve(controller)
              }
              controller.addListener("ready", finish)
              controller.addListener("playback_update", (e) => {
                finish()
                // Spotify reports isBuffering while it's still loading the audio
                // stream — only clear the spinner once it's actually flowing.
                if (awaitingStartRef.current && !e.data.isBuffering) {
                  awaitingStartRef.current = false
                  setConnecting(false)
                }
                if (e.data.isPaused && e.data.position === 0 && activeTrackId === trackId) {
                  onPlay("")
                }
              })
              setTimeout(finish, 1500)
            }
          )
        })
        .catch(reject)
    })

    return readyPromiseRef.current
  }

  async function handleClick() {
    if (isPlaying) {
      controllerRef.current?.pause()
      onPlay("")
      return
    }
    setConnecting(true)
    setError(false)
    awaitingStartRef.current = true
    try {
      const controller = await ensureController()
      controller.play()
      onPlay(trackId)
      // Safety net in case no buffering-false update ever arrives
      setTimeout(() => {
        if (awaitingStartRef.current) {
          awaitingStartRef.current = false
          setConnecting(false)
        }
      }, 8000)
    } catch {
      awaitingStartRef.current = false
      setError(true)
      setConnecting(false)
    }
  }

  return (
    <>
      {/* Outer wrapper is never touched by Spotify's API — createController replaces
          the inner div with a real iframe, which would otherwise lose this hiding/
          clipping since the inline styles live on the element being replaced. */}
      <div
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none", zIndex: -1 }}
        aria-hidden
      >
        <div ref={containerRef} />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        disabled={connecting}
        className="relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-80"
        style={{ background: error ? "#ff6b6b" : "#1DB954" }}
        title={error ? "Preview failed" : isPlaying ? "Stop preview" : "Preview"}
      >
        {connecting ? (
          <span
            className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "white", borderTopColor: "transparent" }}
          />
        ) : error ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        ) : isPlaying ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
            <path d="M0 0l10 6-10 6z" />
          </svg>
        )}
      </button>
    </>
  )
}
