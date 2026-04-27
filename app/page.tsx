"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { status } = useSession()
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative" style={{ background: "#0A0A0A" }}>

      {/* Logo / wordmark */}
      <div className="mb-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "#FF6B00" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-1-11v6l4.5 2.7-.75 1.23L9 14V8h2z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">The Drop</span>
        </div>

        <h1
          className="text-5xl font-bold tracking-tight mb-4 leading-tight"
          style={{ color: "#FFFFFF" }}
        >
          Build your ride.
        </h1>
        <p className="text-lg max-w-sm mx-auto leading-relaxed" style={{ color: "#888888" }}>
          Create perfectly paced Spotify playlists matched to every phase of your spin class.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        {["Warmup to Cooldown", "Segment-matched tracks", "30-sec previews", "Save to Spotify"].map(
          (f) => (
            <span
              key={f}
              className="text-sm px-4 py-2 rounded-full"
              style={{
                background: "#1A1A1A",
                color: "#888888",
                border: "1px solid #2A2A2A",
              }}
            >
              {f}
            </span>
          )
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() =>
          status === "authenticated"
            ? router.push("/classes/new")
            : signIn("spotify", { callbackUrl: "/classes/new" })
        }
        className="flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold transition-opacity hover:opacity-90 active:scale-95"
        style={{ background: "#FF6B00", color: "#FFFFFF" }}
      >
        <SpotifyIcon />
        {status === "authenticated" ? "Build my ride" : "Connect with Spotify"}
      </button>

      <p className="mt-6 text-sm" style={{ color: "#444444" }}>
        Free to use · No credit card required
      </p>
    </main>
  )
}

function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}
