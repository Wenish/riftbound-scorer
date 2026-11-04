// PWA adapter: the only place that touches the service worker and StorageManager APIs.
// Inside Tauri nothing here runs; the native app ships no service worker.
import { isTauri } from '@tauri-apps/api/core'
import { readonly, ref, type Ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

export interface PwaUpdate {
  /** A new version is installed and waiting; show the "Update available" prompt. */
  needRefresh: Readonly<Ref<boolean>>
  /** The app was cached for the first time and now works offline. */
  offlineReady: Readonly<Ref<boolean>>
  /** Activate the waiting version and reload. Call only from an explicit user action. */
  applyUpdate: () => Promise<void>
  /** Hide the prompts until the next update is found. */
  dismiss: () => void
}

let instance: PwaUpdate | undefined

/** Registers the service worker once (browser only) and exposes its update state. */
export function usePwaUpdate(): PwaUpdate {
  instance ??= createPwaUpdate()
  return instance
}

function createPwaUpdate(): PwaUpdate {
  const needRefresh = ref(false)
  const offlineReady = ref(false)
  let applyUpdate = async () => {}

  if (!isTauri() && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    let userRequestedReload = false
    let newVersionControlling = false
    const sw = useRegisterSW({
      onNeedRefresh: () => {
        needRefresh.value = true
      },
      onOfflineReady: () => {
        offlineReady.value = true
      },
      // Fired when the new worker takes control. If that was caused by another tab, don't reload
      // this one behind the user's back (a match may be running); keep the prompt up instead.
      onNeedReload: () => {
        newVersionControlling = true
        if (userRequestedReload) window.location.reload()
        else needRefresh.value = true
      },
      onRegisterError: () => {
        // Best effort: the app still works online without a service worker.
      },
    })
    applyUpdate = async () => {
      userRequestedReload = true
      // The new worker is already in control (activated from another tab): just reload.
      if (newVersionControlling) window.location.reload()
      else await sw.updateServiceWorker()
    }
  }

  return {
    needRefresh: readonly(needRefresh),
    offlineReady: readonly(offlineReady),
    applyUpdate: () => applyUpdate(),
    dismiss: () => {
      needRefresh.value = false
      offlineReady.value = false
    },
  }
}

/** Asks the browser not to evict local data (best effort, browser only). */
export async function requestPersistentStorage(): Promise<void> {
  if (isTauri() || typeof navigator === 'undefined') return
  const storage = navigator.storage
  if (!storage?.persisted || !storage.persist) return
  try {
    if (!(await storage.persisted())) await storage.persist()
  } catch {
    // Unsupported or denied; nothing else to do.
  }
}

/** True in a plain browser tab (not Tauri, not an installed/standalone PWA): show an install hint. */
export function shouldHintInstall(): boolean {
  if (isTauri() || typeof window === 'undefined') return false
  const standalone =
    (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  return !standalone
}
