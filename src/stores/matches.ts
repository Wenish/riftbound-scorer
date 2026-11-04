import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  addScore,
  createMatch,
  deriveState,
  passTurn as passTurnLogic,
  pauseMatch,
  resumeMatch,
  undo as undoLogic,
  type Battlefield,
  type Match,
  type MatchAction,
  type PlayerIndex,
  type ScoreType,
} from '../game'
import { getStorage } from './storage'

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const useMatchesStore = defineStore('matches', () => {
  /** Finished and unfinished matches, newest first. */
  const history = ref<Match[]>([])
  const active = ref<Match | null>(null)
  const loaded = ref(false)

  // Saves are chained so writes reach storage in order.
  let queue: Promise<void> = Promise.resolve()
  function persist(match: Match): Promise<void> {
    const snapshot: Match = JSON.parse(JSON.stringify(match))
    queue = queue.then(async () => (await getStorage()).saveMatch(snapshot))
    return queue
  }

  const unfinished = computed(() => history.value.find((m) => m.endedAt === undefined) ?? null)
  const activeState = computed(() => (active.value ? deriveState(active.value, Date.now()) : null))

  async function load(): Promise<void> {
    const storage = await getStorage()
    history.value = await storage.listMatches()
    active.value = (await storage.getUnfinishedMatch()) ?? null
    loaded.value = true
  }

  /** Replace the active match, mirror it in history and write it to storage. */
  async function commit(next: Match): Promise<void> {
    active.value = next
    const i = history.value.findIndex((m) => m.id === next.id)
    if (i >= 0) history.value[i] = next
    else history.value.unshift(next)
    await persist(next)
  }

  async function mutate(fn: (m: Match) => Match): Promise<void> {
    if (!active.value) return
    await commit(fn(active.value))
  }

  async function startMatch(names: [string, string], firstPlayer: PlayerIndex): Promise<Match> {
    // Never leave two unfinished matches: discard any existing one first.
    for (const old of history.value.filter((m) => m.endedAt === undefined)) await remove(old.id)
    const match = createMatch({ id: newId(), now: Date.now(), names, firstPlayer })
    await commit(match)
    return match
  }

  /** Re-open an unfinished match from history as the active one. */
  function resume(id: string): void {
    active.value = history.value.find((m) => m.id === id && m.endedAt === undefined) ?? null
  }

  /** Leave the match screen; the match stays in history. */
  function closeActive(): void {
    active.value = null
  }

  const score = (args: { player: PlayerIndex; type: ScoreType; battlefield?: Battlefield; turn?: number }) =>
    mutate((m) => addScore(m, { ...args, now: Date.now(), id: newId() }))

  const special = (player: PlayerIndex, turn?: number) => score({ player, type: 'special', turn })

  const passTurn = () => mutate((m) => passTurnLogic(m, { now: Date.now(), id: newId() }))

  /** Undoes the last action; resolves to it (or null if nothing to undo). */
  async function undo(): Promise<MatchAction | null> {
    if (!active.value) return null
    const result = undoLogic(active.value)
    if (!result.undone) return null
    await commit(result.match)
    return result.undone
  }

  const pause = () => mutate((m) => pauseMatch(m, Date.now()))
  const resumeTimer = () => mutate((m) => resumeMatch(m, Date.now()))

  async function remove(id: string): Promise<void> {
    history.value = history.value.filter((m) => m.id !== id)
    if (active.value?.id === id) active.value = null
    queue = queue.then(async () => (await getStorage()).deleteMatch(id))
    await queue
  }

  return {
    history,
    active,
    activeState,
    unfinished,
    loaded,
    load,
    startMatch,
    resume,
    closeActive,
    score,
    special,
    passTurn,
    undo,
    pause,
    resumeTimer,
    remove,
  }
})
