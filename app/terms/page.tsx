export default function TermsOfService() {
  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto" style={{ background: "#0A0A0A", color: "#E0E0E0" }}>
      <h1 className="text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>Terms of Service</h1>
      <p className="text-sm mb-10" style={{ color: "#888888" }}>Last updated: April 19, 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>About The Drop</h2>
        <p>The Drop is a personal, non-commercial web application that helps spin instructors build Spotify playlists for their classes.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>Use of the app</h2>
        <p>By using The Drop, you agree to:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Use the app for personal, non-commercial purposes only</li>
          <li>Have a valid Spotify account and comply with Spotify&apos;s Terms of Service</li>
          <li>Not attempt to misuse, reverse-engineer, or disrupt the app</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>No warranties</h2>
        <p>The Drop is provided &quot;as is&quot; without any warranties. We do not guarantee the app will be available at all times or free of errors. We are not responsible for any data loss or issues that arise from using the app.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>Third-party services</h2>
        <p>The Drop integrates with Spotify. Spotify is a third-party service and has its own Terms of Service and Privacy Policy, which apply independently of The Drop.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>Contact</h2>
        <p>Questions? Email <a href="mailto:bethany.a.oconnell@gmail.com" className="underline" style={{ color: "#1DB954" }}>bethany.a.oconnell@gmail.com</a>.</p>
      </section>
    </main>
  )
}
