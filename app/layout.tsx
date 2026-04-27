import type { Metadata } from "next"
import "./globals.css"
import Providers from "@/components/Providers"
import AccountMenu from "@/components/AccountMenu"

export const metadata: Metadata = {
  title: "The Drop — Build Your Ride",
  description: "Create perfectly paced Spotify playlists for spin classes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "#0A0A0A" }}>
        <Providers>
          <div className="fixed top-4 right-4 z-50">
            <AccountMenu />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  )
}
