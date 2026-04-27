"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"

export default function AccountMenu() {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (!session) return null

  const name = session.user?.name
  const email = session.user?.email

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
        style={{ background: "#1A1A1A", border: "1px solid #2A2A2A" }}
        aria-label="Account"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="#888888">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-2xl overflow-hidden min-w-[200px] z-50"
          style={{ background: "#1A1A1A", border: "1px solid #2A2A2A", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
        >
          {/* User info */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid #2A2A2A" }}>
            {name && <p className="text-sm font-semibold text-white truncate">{name}</p>}
            {email && <p className="text-xs mt-0.5 truncate" style={{ color: "#888888" }}>{email}</p>}
          </div>

          {/* My Rides */}
          <button
            onClick={() => { setOpen(false); router.push("/my-rides") }}
            className="w-full px-4 py-3 text-sm text-left text-white hover:opacity-70 transition-opacity"
            style={{ borderBottom: "1px solid #2A2A2A" }}
          >
            My Rides
          </button>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-4 py-3 text-sm text-left transition-opacity hover:opacity-70"
            style={{ color: "#888888" }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
