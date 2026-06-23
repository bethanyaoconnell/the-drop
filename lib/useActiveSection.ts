"use client"

import { useCallback, useEffect, useRef, useState } from "react"

// Tracks which section is "active" as the user scrolls — the topmost section
// currently inside a band near the top of the viewport (just below any sticky
// headers). Falls back to the first id once ids become available, since on
// pages where sections load asynchronously (e.g. from sessionStorage) the
// initial useState value can't capture them yet.
export function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "")
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const intersecting = useRef<Set<string>>(new Set())
  const idsKey = ids.join("|")

  useEffect(() => {
    if (!activeId && ids.length > 0) {
      setActiveId(ids[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  useEffect(() => {
    if (ids.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.sectionId
          if (!id) continue
          if (entry.isIntersecting) intersecting.current.add(id)
          else intersecting.current.delete(id)
        }
        const firstVisible = ids.find((id) => intersecting.current.has(id))
        if (firstVisible) setActiveId(firstVisible)
      },
      // Trigger zone starts ~140px below the viewport top (clearing sticky
      // headers) and ends at the vertical midpoint, so a section only becomes
      // active once it's genuinely the one the user is reading.
      { rootMargin: "-140px 0px -50% 0px", threshold: 0 }
    )

    ids.forEach((id) => {
      const el = refs.current[id]
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey])

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      refs.current[id] = el
    },
    []
  )

  const scrollTo = useCallback((id: string) => {
    setActiveId(id)
    refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return { activeId, setRef, scrollTo }
}
