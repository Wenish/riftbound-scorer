/** Screen keep-awake via the Screen Wake Lock API. Silently no-ops when unsupported. */

let sentinel: WakeLockSentinel | null = null
let wanted = false
let listening = false

async function acquire(): Promise<void> {
  if (!wanted || sentinel || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
  try {
    const s = await navigator.wakeLock.request('screen')
    if (!wanted) {
      await s.release().catch(() => {})
      return
    }
    sentinel = s
    s.addEventListener('release', () => {
      if (sentinel === s) sentinel = null
    })
  } catch {
    // Unsupported, denied, or page not visible: ignore.
  }
}

function onVisibility(): void {
  if (document.visibilityState === 'visible') void acquire()
}

export async function keepAwake(): Promise<void> {
  wanted = true
  if (!listening && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility)
    listening = true
  }
  await acquire()
}

export async function release(): Promise<void> {
  wanted = false
  if (listening && typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibility)
    listening = false
  }
  const s = sentinel
  sentinel = null
  if (s) await s.release().catch(() => {})
}
