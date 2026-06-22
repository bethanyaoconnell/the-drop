declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIFrameAPI) => void
    __spotifyIframeApi?: SpotifyIFrameAPI
  }
}

export type SpotifyEmbedController = {
  play: () => void
  pause: () => void
  resume: () => void
  destroy: () => void
  addListener: (event: string, cb: (e: { data: { isPaused: boolean; isBuffering: boolean; position: number; duration: number } }) => void) => void
}

type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string | number; height?: string | number },
    callback: (controller: SpotifyEmbedController) => void
  ) => void
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null

export function getSpotifyIframeApi(): Promise<SpotifyIFrameAPI> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"))
  if (window.__spotifyIframeApi) return Promise.resolve(window.__spotifyIframeApi)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      window.__spotifyIframeApi = IFrameAPI
      resolve(IFrameAPI)
    }
    const script = document.createElement("script")
    script.src = "https://open.spotify.com/embed/iframe-api/v1"
    script.async = true
    document.body.appendChild(script)
  })

  return apiPromise
}
