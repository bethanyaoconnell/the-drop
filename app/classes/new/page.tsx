"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { CLASS_TEMPLATES } from "@/lib/templates"
import AccountMenu from "@/components/AccountMenu"

export default function NewClassPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return <LoadingScreen />
  }

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: "#0A0A0A" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/")}
              className="text-sm flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: "#888888" }}
            >
              <span>←</span> Back
            </button>
            <AccountMenu />
          </div>
          <p className="text-sm font-medium mb-2 uppercase tracking-widest" style={{ color: "#FF6B00" }}>
            New Class
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Choose a template</h1>
          <p className="mt-3 text-base" style={{ color: "#888888" }}>
            Each template defines the phases of your class. You&apos;ll pick tracks for each one.
          </p>
        </div>

        {/* Template cards */}
        <div className="flex flex-col gap-4">
          {CLASS_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => router.push(`/classes/${template.id}`)}
              className="w-full text-left p-6 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "#1A1A1A",
                border: "1px solid #2A2A2A",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{template.name}</h2>
                  <p className="text-sm" style={{ color: "#888888" }}>
                    {template.description}
                  </p>
                </div>
                <span
                  className="text-sm font-semibold px-3 py-1 rounded-full ml-4 shrink-0"
                  style={{ background: "#FF6B0022", color: "#FF6B00" }}
                >
                  {template.totalMin} min
                </span>
              </div>

              {/* Segment pills */}
              <div className="flex flex-wrap gap-2">
                {template.segments.map((seg) => (
                  <span
                    key={seg.id}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{
                      background: "#242424",
                      color: "#888888",
                      border: "1px solid #2A2A2A",
                    }}
                  >
                    {seg.name} · {seg.durationMin}m
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#FF6B00", borderTopColor: "transparent" }} />
    </div>
  )
}
