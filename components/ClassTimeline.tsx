"use client"

import { ClassTemplate } from "@/lib/templates"

type Props = {
  template: ClassTemplate
  activeSegmentId: string
  trackCounts: Record<string, number>
  onSegmentClick: (segmentId: string) => void
}

export default function ClassTimeline({
  template,
  activeSegmentId,
  trackCounts,
  onSegmentClick,
}: Props) {
  const totalMin = template.segments.reduce((s, seg) => s + seg.durationMin, 0)

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
    >
      <div className="flex items-end justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#888888" }}>
          Class Arc
        </p>
        <p className="text-xs" style={{ color: "#444444" }}>
          {totalMin} min total
        </p>
      </div>

      {/* Waveform bars */}
      <div className="flex items-end gap-1 h-16" role="group" aria-label="Class energy timeline">
        {template.segments.map((seg) => {
          const widthPct = (seg.durationMin / totalMin) * 100
          const heightPct = Math.max(20, seg.energy * 100)
          const isActive = seg.id === activeSegmentId
          const hasTrack = (trackCounts[seg.id] ?? 0) > 0

          return (
            <button
              key={seg.id}
              onClick={() => onSegmentClick(seg.id)}
              title={`${seg.name} · ${seg.durationMin}min`}
              className="relative flex flex-col items-center justify-end h-full transition-all hover:opacity-80"
              style={{ width: `${widthPct}%` }}
            >
              <div
                className="w-full rounded-sm transition-all"
                style={{
                  height: `${heightPct}%`,
                  background: isActive ? "#FF6B00" : hasTrack ? seg.color : "#2A2A2A",
                  opacity: isActive ? 1 : 0.6,
                  outline: isActive ? "2px solid #FF6B00" : "none",
                  outlineOffset: "2px",
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Segment labels */}
      <div className="flex gap-1 mt-3">
        {template.segments.map((seg) => {
          const widthPct = (seg.durationMin / totalMin) * 100
          const isActive = seg.id === activeSegmentId
          const count = trackCounts[seg.id] ?? 0

          return (
            <button
              key={seg.id}
              onClick={() => onSegmentClick(seg.id)}
              className="text-left overflow-hidden transition-colors"
              style={{ width: `${widthPct}%` }}
            >
              <p
                className="text-xs font-medium truncate"
                style={{ color: isActive ? "#FF6B00" : "#888888" }}
              >
                {seg.name}
              </p>
              <p className="text-xs" style={{ color: "#444444" }}>
                {count > 0 ? `${count} track${count !== 1 ? "s" : ""}` : `${seg.durationMin}m`}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
