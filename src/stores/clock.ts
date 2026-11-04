import { onScopeDispose, readonly, ref, type Ref } from 'vue'

const TICK_MS = 250
const now = ref(Date.now())
let subscribers = 0
let timer: ReturnType<typeof setInterval> | undefined

/**
 * Shared `now` (epoch ms) that updates every 250 ms while at least one scope uses it.
 * Timers must derive their display from timestamps and this value, never count ticks.
 */
export function useNow(): Readonly<Ref<number>> {
  now.value = Date.now()
  if (subscribers++ === 0) timer = setInterval(() => (now.value = Date.now()), TICK_MS)
  onScopeDispose(() => {
    if (--subscribers === 0 && timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  })
  return readonly(now)
}
