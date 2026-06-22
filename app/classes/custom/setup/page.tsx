"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CustomSection,
  CUSTOM_COLORS,
  newSection,
  saveDraftStructure,
} from "@/lib/customStructure"

export default function CustomSetupPage() {
  const { status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState<"setup" | "preview">("setup")
  const [name, setName] = useState("My Custom Ride")
  const [totalTargetMin, setTotalTargetMin] = useState(45)
  const [sections, setSections] = useState<CustomSection[]>([
    newSection("Warm-up", 10),
    newSection("Main set", 25),
    newSection("Cool-down", 10),
  ])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/")
  }, [status, router])

  if (status === "loading") return <LoadingScreen />

  const plannedTotal = sections.reduce((s, sec) => s + sec.durationMin, 0)
  const diff = plannedTotal - totalTargetMin
  const matchesTarget = Math.abs(diff) < 0.5

  function updateSection(id: string, patch: Partial<CustomSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  function addSection() {
    setSections((prev) => [...prev, newSection("", 5)])
  }

  function handleStartBuilding() {
    saveDraftStructure({ name, sections })
    router.push("/classes/custom")
  }

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: "#0A0A0A" }}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => (step === "setup" ? router.push("/classes/new") : setStep("setup"))}
          className="text-sm mb-6 flex items-center gap-2 transition-opacity hover:opacity-70"
          style={{ color: "#888888" }}
        >
          <span>←</span> Back
        </button>

        <p className="text-sm font-medium mb-2 uppercase tracking-widest" style={{ color: "#FF6B00" }}>
          Custom Structure
        </p>

        {step === "setup" ? (
          <>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Define your structure</h1>
            <p className="text-base mb-8" style={{ color: "#888888" }}>
              Set a total duration, then break it into your own sections.
            </p>

            {/* Ride name + total duration */}
            <div className="flex flex-col gap-4 mb-8">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-widest block mb-2" style={{ color: "#888888" }}>
                  Ride name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-widest block mb-2" style={{ color: "#888888" }}>
                  Total duration (minutes)
                </span>
                <input
                  type="number"
                  min={1}
                  value={totalTargetMin}
                  onChange={(e) => setTotalTargetMin(Number(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                />
              </label>
            </div>

            {/* Running total */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
              style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
            >
              <span className="text-sm" style={{ color: "#888888" }}>Sections total</span>
              <span
                className="text-sm font-semibold tabular-nums"
                style={{ color: matchesTarget ? "#22C55E" : "#ff9f43" }}
              >
                {plannedTotal} / {totalTargetMin} min
                {!matchesTarget && (diff > 0 ? ` (+${diff})` : ` (${diff})`)}
              </span>
            </div>

            {/* Section rows */}
            <div className="flex flex-col gap-3 mb-4">
              {sections.map((sec, i) => (
                <div
                  key={sec.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
                >
                  <span
                    className="w-2 h-8 rounded-full shrink-0"
                    style={{ background: CUSTOM_COLORS[i % CUSTOM_COLORS.length] }}
                  />
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
                    className="w-16 px-2 py-1.5 rounded-lg text-sm text-white text-right outline-none tabular-nums"
                    style={{ background: "#242424", border: "1px solid #2A2A2A" }}
                  />
                  <span className="text-xs shrink-0" style={{ color: "#666666" }}>min</span>
                  <button
                    onClick={() => removeSection(sec.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-70"
                    style={{ background: "#242424", color: "#888888" }}
                    aria-label="Remove section"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addSection}
              className="w-full py-3 rounded-xl text-sm font-medium mb-8 transition-all hover:opacity-80"
              style={{ background: "#1A1A1A", color: "#FF6B00", border: "1px dashed #FF6B0055" }}
            >
              + Add section
            </button>

            <button
              onClick={() => setStep("preview")}
              disabled={sections.length === 0}
              className="w-full py-3.5 rounded-full font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: "#FF6B00" }}
            >
              Preview structure
            </button>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">{name}</h1>
            <p className="text-base mb-8" style={{ color: "#888888" }}>
              {plannedTotal} min planned
              {!matchesTarget && (
                <span style={{ color: "#ff9f43" }}>
                  {" "}· {diff > 0 ? `${diff} min over` : `${Math.abs(diff)} min under`} your {totalTargetMin} min target
                </span>
              )}
            </p>

            {/* Segmented bar */}
            <div className="flex w-full h-10 rounded-xl overflow-hidden mb-4 gap-0.5">
              {sections.map((sec, i) => (
                <div
                  key={sec.id}
                  style={{
                    width: `${plannedTotal > 0 ? (sec.durationMin / plannedTotal) * 100 : 0}%`,
                    background: CUSTOM_COLORS[i % CUSTOM_COLORS.length],
                  }}
                  title={`${sec.name} · ${sec.durationMin}m`}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2 mb-10">
              {sections.map((sec, i) => (
                <div key={sec.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#1A1A1A" }}>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: CUSTOM_COLORS[i % CUSTOM_COLORS.length] }}
                  />
                  <span className="flex-1 text-sm font-medium text-white">{sec.name || `Section ${i + 1}`}</span>
                  <span className="text-sm tabular-nums" style={{ color: "#888888" }}>{sec.durationMin} min</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("setup")}
                className="flex-1 py-3.5 rounded-full font-semibold text-sm"
                style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888888" }}
              >
                Edit
              </button>
              <button
                onClick={handleStartBuilding}
                className="flex-1 py-3.5 rounded-full font-semibold text-white"
                style={{ background: "#FF6B00" }}
              >
                Start building
              </button>
            </div>
          </>
        )}
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
