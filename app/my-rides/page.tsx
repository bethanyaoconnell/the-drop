"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getPlaylists, deletePlaylist, SavedPlaylist } from "@/lib/localPlaylists"
import { formatDuration } from "@/lib/spotify"
import AccountMenu from "@/components/AccountMenu"

export default function MyRidesPage() {
  const router = useRouter()
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([])

  useEffect(() => {
    setPlaylists(getPlaylists())
  }, [])

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    deletePlaylist(id)
    setPlaylists(getPlaylists())
  }

  return (
    <main className="min-h-screen pb-16" style={{ background: "#0A0A0A" }}>
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center gap-4"
        style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1A1A1A" }}
      >
        <button
          onClick={() => router.push("/")}
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1A1A1A" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#888888">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <h1 className="flex-1 text-base font-bold text-white">My Rides</h1>
        <AccountMenu />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {playlists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-white font-semibold mb-2">No saved rides yet</p>
            <p className="text-sm mb-6" style={{ color: "#888888" }}>
              Build a class and hit Save to find it here.
            </p>
            <button
              onClick={() => router.push("/classes/new")}
              className="px-6 py-3 rounded-full font-semibold text-white"
              style={{ background: "#FF6B00" }}
            >
              Build a ride
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {playlists.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/my-rides/${p.id}`)}
                className="flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{p.name}</p>
                  <p className="text-sm mt-0.5" style={{ color: "#888888" }}>
                    {p.totalTracks} tracks · {formatDuration(p.totalDurationMs)} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(p.id, e)}
                  className="ml-4 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-80"
                  style={{ background: "#242424" }}
                  aria-label="Delete ride"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#888888">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
