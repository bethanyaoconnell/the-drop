# The Drop — Content Strategy

This doc exists so future copy (new features, emails, store listings, etc.) stays
consistent with the repositioning away from spin-only language toward all fitness
class formats. Read this before writing new user-facing text.

## Positioning statement

> The Drop helps fitness instructors build perfectly paced Spotify playlists for
> every class they teach — matched to the warmup, the work, and the cooldown,
> whatever format that class takes.

The product mechanic (pick a structure → fill each phase with tracks → save or
queue) is format-agnostic. The copy now reflects that; the underlying templates
already generalize reasonably well (warmup → build → peak effort → cooldown maps
onto spin, HIIT, strength circuits, and dance cardio) and yoga/barre/pilates
instructors can use "Build my own structure" for flow-based or low-impact
formats that don't fit a high-intensity arc.

## Target personas

| Persona | What they're doing today | What they need from music | Core value prop |
|---|---|---|---|
| **Spin instructor** | Curating playlists by BPM/energy phase, often manually in Spotify or a notes app | Tempo-matched tracks per interval, fast swaps mid-build | Build a tempo-matched arc without spreadsheets |
| **HIIT coach** | Building work/rest interval music, often timer-app + separate playlist | High-energy tracks that hit hard right at "go," clear rest-phase contrast | Match music intensity to interval structure automatically |
| **Yoga teacher** | Hand-picking ambient/flow music, very sensitive to transitions | Calm, non-jarring tracks that don't disrupt breath/flow; flexible custom structure (no rigid "peak") | Total structural freedom — define your own flow, no forced intensity curve |
| **Pilates teacher** | Similar to yoga — controlled, low-impact, often quieter music throughout | Subtle energy variation, not extremes; precise timing per exercise block | Fine-grained section timing without needing "peak intervals" language |
| **Barre teacher** | Mixes upbeat pop/dance with slower holds | Distinct energy shifts between standing/floor work | Segment-based structure that mirrors class choreography blocks |
| **Zumba instructor** | Building dance-genre playlists (Latin, pop, reggaeton) matched to choreography blocks | Genre-flexible search, not just "workout" keyword matches | Search any genre/artist, organize by song block instead of generic phases |
| **Strength / free-weight coach** | Often the least playlist-precious persona — wants "good background energy" with set/rest awareness | Steady motivating energy, less need for fine BPM matching | Fast, low-effort playlist building — minimal setup, sensible defaults |

Spin instructors remain a core, well-served persona — nothing about this
repositioning narrows their experience. The change is additive: broadening who
else recognizes themselves in the copy.

## Messaging pillars

1. **Structure, not just songs.** The product's differentiator is matching music
   to the *shape* of a class, not just generating a generic workout playlist.
   Lead with "phases," "structure," "arc" — not just "playlists."
2. **Any format, your rules.** Templates are a shortcut, not a requirement.
   "Build my own structure" should always be presented as a first-class option,
   not a fallback — this is what makes the product work for yoga/pilates/barre
   instructors whose classes don't follow a HIIT-style intensity curve.
3. **Built for the person teaching, not the person working out.** Copy should
   speak instructor-to-instructor ("your class," "your students"), not
   consumer-fitness-app language ("your workout," "crush your goals").
4. **Honest about Spotify's limits.** The app cannot create playlists directly
   in Spotify (platform restriction, not a bug) — copy should never imply
   one-click Spotify playlist creation. Current real capabilities are: build/save
   in-app, queue to an active Spotify device, or copy the track list. Don't
   overpromise here even for the sake of a punchier tagline.

## Voice & tone

- Direct, practical, low-hype. Instructors are professionals solving a real
  prep-time problem — avoid consumer-fitness exclamation-point energy
  ("Crush it!! 🔥"). One exception: short celebratory confirmations (e.g.
  "Playlist saved!") are fine since they're functional feedback, not marketing.
- Plain language over jargon. "Class," "session," "students" — never "ride,"
  "the bike," "cadence," "cyclist," "pedal," "saddle," or other spin-specific
  terms, even in placeholder/example text.
  "BPM" and "tempo" are fine — they're understood across formats, not spin-exclusive.
- When giving format examples, default to a representative spread (e.g. "yoga,
  spin, HIIT, strength") rather than naming only one or two formats, and avoid
  always listing spin first out of habit.

## Terminology glossary (for consistency)

| Concept | Term to use | Avoid |
|---|---|---|
| The thing you're building before adding tracks | **class** / **structure** | "ride" |
| The saved result with tracks in it | **playlist** | "ride," "the build" |
| A phase within a class (warmup, peak, etc.) | **section** / **segment** | "lap," "interval block" (ok only for HIIT-specific copy) |
| The person using the app | **instructor** | "rider," "cyclist" |
| The people in the class | **students** / **class** | "riders" |
| Naming the structure itself | **class name** | "ride name" |
| Naming the saved artifact | **playlist name** | "ride name" |

## Copy guidelines for future features

- Before shipping new copy, grep for `ride`, `spin`, `cadence`, `cyclist`,
  `pedal`, `bike` (case-insensitive) across `app/`, `components/`, `lib/` —
  these should only ever appear when spin is being named alongside other
  formats, never as the default/implicit audience.
- New template content (e.g. a "Vinyasa Flow" or "Tabata Circuit" preset) should
  use format-appropriate phase names rather than forcing every template into
  warmup/build/peak/cooldown. It's fine for a yoga template to use phases like
  "Opening," "Flow," "Peak pose," "Savasana" instead.
  Note: template phase names are free-text (`Segment.name` in
  [lib/templates.ts](lib/templates.ts)) — discipline-specific naming requires
  no schema change, just new template entries.
  New segment search-query strings (`searchQueries`) should stay genre/format
  agnostic by default ("workout music," "cardio beats") unless the segment
  itself is discipline-specific by design.
- Empty states and placeholders should read naturally for someone who has never
  taken a spin class — test by mentally substituting "yoga" or "barre" into the
  sentence and checking it still makes sense.
- Legal pages (privacy/terms) describe the app's actual audience — keep these
  in sync with the positioning statement above if it changes again.
