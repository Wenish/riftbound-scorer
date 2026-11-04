import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ViewName = 'loading' | 'onboarding' | 'home' | 'new-match' | 'match' | 'detail'

export interface ViewParams {
  /** Match id for the 'detail' view. */
  matchId?: string
}

/** Minimal navigation (no vue-router): views call `navigate(view, params)`. */
export const useNavStore = defineStore('nav', () => {
  const view = ref<ViewName>('loading')
  const params = ref<ViewParams>({})

  function navigate(next: ViewName, nextParams: ViewParams = {}): void {
    params.value = nextParams
    view.value = next
  }

  return { view, params, navigate }
})
