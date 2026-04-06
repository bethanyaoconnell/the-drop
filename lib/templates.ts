export type SegmentType = "warmup" | "build" | "intervals" | "peak" | "climb" | "cooldown"

export type Segment = {
  id: string
  type: SegmentType
  name: string
  durationMin: number
  bpmMin: number
  bpmMax: number
  energy: number  // 0–1, used for waveform height
  color: string   // accent color for this segment
  searchQueries: string[]
}

export type ClassTemplate = {
  id: string
  name: string
  totalMin: number
  description: string
  segments: Segment[]
}

const SEGMENT_COLORS: Record<SegmentType, string> = {
  warmup:    "#888888",
  build:     "#FF9500",
  intervals: "#FF6B00",
  peak:      "#FF3B30",
  climb:     "#FF6B00",
  cooldown:  "#555555",
}

const SEGMENT_SEARCH_QUERIES: Record<SegmentType, string[]> = {
  warmup:    ["workout warmup music", "warm up cardio beats", "light workout motivation"],
  build:     ["building energy workout", "progressive cardio music", "workout build up"],
  intervals: ["HIIT interval workout music", "high intensity intervals", "sprint workout EDM"],
  peak:      ["peak cardio intensity", "cycling race music EDM", "maximum effort workout"],
  climb:     ["steady climb cycling music", "power endurance workout", "hill climb motivation"],
  cooldown:  ["workout cooldown music", "post workout relax", "cool down stretch"],
}

function seg(
  id: string,
  type: SegmentType,
  name: string,
  durationMin: number,
  bpmMin: number,
  bpmMax: number,
  energy: number
): Segment {
  return {
    id,
    type,
    name,
    durationMin,
    bpmMin,
    bpmMax,
    energy,
    color: SEGMENT_COLORS[type],
    searchQueries: SEGMENT_SEARCH_QUERIES[type],
  }
}

export const CLASS_TEMPLATES: ClassTemplate[] = [
  {
    id: "45min-hiit",
    name: "45-Min HIIT Ride",
    totalMin: 45,
    description: "High-intensity intervals with a build and recovery arc",
    segments: [
      seg("warmup",    "warmup",    "Warmup",         5,  110, 130, 0.40),
      seg("build",     "build",     "Build",          8,  125, 145, 0.65),
      seg("intervals", "intervals", "Peak Intervals", 15, 145, 175, 0.90),
      seg("climb",     "climb",     "Climb",          10, 135, 155, 0.75),
      seg("cooldown",  "cooldown",  "Cooldown",       7,  80,  110, 0.25),
    ],
  },
  {
    id: "30min-express",
    name: "30-Min Express",
    totalMin: 30,
    description: "Quick and efficient — full arc in half the time",
    segments: [
      seg("warmup",    "warmup",    "Warmup",   5,  110, 130, 0.40),
      seg("intervals", "intervals", "Intervals",15, 145, 175, 0.90),
      seg("cooldown",  "cooldown",  "Cooldown", 10, 80,  110, 0.25),
    ],
  },
  {
    id: "60min-endurance",
    name: "60-Min Endurance",
    totalMin: 60,
    description: "Long, steady effort with sustained power phases",
    segments: [
      seg("warmup",    "warmup",    "Warmup",       8,  110, 130, 0.40),
      seg("build",     "build",     "Build",        10, 125, 145, 0.65),
      seg("climb",     "climb",     "Steady Climb", 20, 135, 155, 0.75),
      seg("peak",      "peak",      "Peak",         12, 145, 175, 0.95),
      seg("cooldown",  "cooldown",  "Cooldown",     10, 80,  110, 0.25),
    ],
  },
]

export function getTemplate(id: string): ClassTemplate | undefined {
  return CLASS_TEMPLATES.find((t) => t.id === id)
}
