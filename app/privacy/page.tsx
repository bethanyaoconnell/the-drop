export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto" style={{ background: "#0A0A0A", color: "#E0E0E0" }}>
      <h1 className="text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>Privacy Policy</h1>
      <p className="text-sm mb-10" style={{ color: "#888888" }}>Last updated: April 19, 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>What is The Drop?</h2>
        <p>The Drop is a web app that helps spin instructors build Spotify playlists for their classes. It is a personal, non-commercial project.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>What data we collect</h2>
        <p>When you connect your Spotify account, we receive:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Your Spotify display name and email address</li>
          <li>A temporary access token to interact with Spotify on your behalf</li>
        </ul>
        <p className="mt-3">We do not store your email or access token in any database. Tokens are held temporarily in your browser session only.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>How we use your data</h2>
        <p>Your Spotify access token is used only to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Search for tracks on Spotify</li>
          <li>Create and save playlists to your Spotify account</li>
        </ul>
        <p className="mt-3">We do not sell, share, or transfer your data to any third party.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>Spotify</h2>
        <p>The Drop uses the Spotify Web API. By using The Drop, you also agree to <a href="https://www.spotify.com/us/legal/end-user-agreement/" className="underline" style={{ color: "#1DB954" }}>Spotify's Terms of Service</a>.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>Contact</h2>
        <p>Questions? Email <a href="mailto:bethany.a.oconnell@gmail.com" className="underline" style={{ color: "#1DB954" }}>bethany.a.oconnell@gmail.com</a>.</p>
      </section>
    </main>
  )
}
