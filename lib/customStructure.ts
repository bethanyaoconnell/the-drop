import { ClassTemplate, Segment } from "./templates"

export type CustomSection = {
  id: string
  name: string
  durationMin: number
}

export const CUSTOM_COLORS = ["#FF6B00", "#00B8D9", "#7C3AED", "#22C55E", "#EAB308", "#EC4899"]

export function newSection(name = "", durationMin = 5): CustomSection {
  return { id: crypto.randomUUID(), name, durationMin }
}

export function customSectionsToSegments(sections: CustomSection[]): Segment[] {
  const n = sections.length
  const mid = (n - 1) / 2
  return sections.map((s, i) => {
    const dist = mid ? Math.abs(i - mid) / mid : 0
    const energy = Math.max(0.25, Math.min(1, 0.9 - dist * 0.55))
    return {
      id: s.id,
      type: "custom",
      name: s.name || `Section ${i + 1}`,
      durationMin: s.durationMin,
      bpmMin: 0,
      bpmMax: 0,
      energy,
      color: CUSTOM_COLORS[i % CUSTOM_COLORS.length],
      searchQueries: [
        s.name || "workout",
        `${s.name} cycling music`,
        `${s.name} workout playlist`,
      ],
    }
  })
}

export function buildCustomTemplate(name: string, sections: CustomSection[]): ClassTemplate {
  return {
    id: "custom",
    name: name || "My Custom Ride",
    totalMin: sections.reduce((sum, s) => sum + s.durationMin, 0),
    description: "Custom structure",
    segments: customSectionsToSegments(sections),
  }
}

const DRAFT_KEY = "the_drop_custom_draft"

export type CustomDraft = { name: string; sections: CustomSection[] }

export function saveDraftStructure(draft: CustomDraft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function loadDraftStructure(): CustomDraft | null {
  if (typeof window === "undefined") return null
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null")
  } catch {
    return null
  }
}

export function clearDraftStructure() {
  sessionStorage.removeItem(DRAFT_KEY)
}
