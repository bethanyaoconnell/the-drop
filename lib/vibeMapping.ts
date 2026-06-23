export type AudioFeatureProfile = {
  energy?: [number, number]
  valence?: [number, number]
  tempo?: [number, number]
  danceability?: [number, number]
}

// Keyword -> Spotify search terms (used when the Recommendations API is unavailable,
// since /v1/search can't filter by audio features — only matches text/genre-ish terms)
const VIBE_SEARCH_TERMS: Record<string, string[]> = {
  energetic: ["energetic dance anthem", "high energy EDM"],
  euphoric: ["euphoric trance", "euphoric uplifting dance"],
  uplifting: ["uplifting house", "feel good anthem"],
  dark: ["dark techno", "dark electronic"],
  driving: ["driving bassline techno", "driving electronic"],
  chill: ["chillout lounge", "chill vibes"],
  floaty: ["dreamy ambient", "floaty downtempo"],
  mellow: ["mellow acoustic", "mellow chill"],
  aggressive: ["aggressive bass", "hard hitting EDM"],
  dreamy: ["dreamy ambient", "dream pop"],
  moody: ["moody atmospheric", "moody electronic"],
  happy: ["feel good pop", "happy upbeat"],
  sad: ["sad emotional", "melancholy ballad"],
  intense: ["intense workout", "intense electronic"],
  relaxed: ["relaxing chill", "laid back groove"],
  calm: ["calm ambient", "peaceful acoustic"],
  powerful: ["powerful anthem", "epic orchestral"],
  epic: ["epic cinematic", "epic orchestral"],
  groovy: ["groovy funk", "groovy disco"],
  smooth: ["smooth R&B", "smooth jazz"],
  hype: ["hype trap", "hype workout"],
  angry: ["angry rock", "aggressive metal"],
  peaceful: ["peaceful ambient", "calm acoustic"],
  nostalgic: ["nostalgic 80s", "throwback classic"],
  romantic: ["romantic R&B", "love ballad"],
  melancholic: ["melancholic indie", "sad atmospheric"],
  upbeat: ["upbeat pop", "feel good dance"],
  downtempo: ["downtempo chill", "downtempo electronic"],
}

// Same keywords -> audio feature target ranges, used only if the Recommendations API
// is confirmed available (it is not, for any Spotify app created after Nov 27, 2024)
const VIBE_AUDIO_PROFILES: Record<string, AudioFeatureProfile> = {
  energetic: { energy: [0.7, 1], tempo: [120, 160] },
  euphoric: { energy: [0.7, 1], valence: [0.7, 1] },
  uplifting: { valence: [0.7, 1], energy: [0.5, 0.9] },
  dark: { valence: [0, 0.35], energy: [0.4, 0.8] },
  driving: { energy: [0.6, 1], tempo: [120, 150], danceability: [0.5, 1] },
  chill: { energy: [0, 0.4], valence: [0.4, 0.8] },
  floaty: { energy: [0, 0.35], danceability: [0, 0.4] },
  mellow: { energy: [0.1, 0.4], valence: [0.3, 0.7] },
  aggressive: { energy: [0.8, 1], valence: [0, 0.4] },
  dreamy: { energy: [0, 0.4], valence: [0.4, 0.8] },
  moody: { valence: [0, 0.4], energy: [0.3, 0.7] },
  happy: { valence: [0.7, 1] },
  sad: { valence: [0, 0.3] },
  intense: { energy: [0.8, 1] },
  relaxed: { energy: [0, 0.35] },
  calm: { energy: [0, 0.3], valence: [0.3, 0.7] },
  powerful: { energy: [0.7, 1] },
  epic: { energy: [0.6, 1], valence: [0.3, 0.7] },
  groovy: { danceability: [0.6, 1] },
  smooth: { energy: [0.2, 0.5], danceability: [0.4, 0.7] },
  hype: { energy: [0.8, 1], danceability: [0.6, 1] },
  angry: { energy: [0.8, 1], valence: [0, 0.3] },
  peaceful: { energy: [0, 0.3], valence: [0.4, 0.8] },
  nostalgic: { valence: [0.3, 0.7] },
  romantic: { valence: [0.5, 0.8], energy: [0.1, 0.5] },
  melancholic: { valence: [0, 0.3], energy: [0.1, 0.4] },
  upbeat: { valence: [0.6, 1], energy: [0.5, 0.9] },
  downtempo: { energy: [0, 0.35], tempo: [60, 100] },
}

const VIBE_KEYWORDS = Object.keys(VIBE_SEARCH_TERMS)

export function isVibeQuery(query: string): boolean {
  const lower = query.toLowerCase()
  const wordCount = query.trim().split(/\s+/).length
  const matches = VIBE_KEYWORDS.filter((kw) => lower.includes(kw))
  return matches.length > 0 && wordCount > 1
}

export function matchedVibeKeywords(query: string): string[] {
  const lower = query.toLowerCase()
  return VIBE_KEYWORDS.filter((kw) => lower.includes(kw))
}

export function vibeSearchTerms(query: string): string[] {
  const matched = matchedVibeKeywords(query)
  const terms = matched.flatMap((kw) => VIBE_SEARCH_TERMS[kw] ?? [])
  return terms.length > 0 ? terms : [query]
}

export function vibeAudioProfile(query: string): AudioFeatureProfile {
  const matched = matchedVibeKeywords(query)
  const profiles = matched.map((kw) => VIBE_AUDIO_PROFILES[kw]).filter(Boolean)
  // Average overlapping ranges across all matched keywords
  const merged: AudioFeatureProfile = {}
  for (const key of ["energy", "valence", "tempo", "danceability"] as const) {
    const ranges = profiles.map((p) => p[key]).filter(Boolean) as [number, number][]
    if (ranges.length > 0) {
      const min = Math.min(...ranges.map((r) => r[0]))
      const max = Math.max(...ranges.map((r) => r[1]))
      merged[key] = [min, max]
    }
  }
  return merged
}
