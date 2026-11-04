import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryStorage } from '../storage/memory'
import { setStorage } from './storage'
import { useMatchesStore } from './matches'
import { useSettingsStore } from './settings'

let storage: ReturnType<typeof createMemoryStorage>
beforeEach(() => {
  storage = createMemoryStorage()
  setStorage(storage)
  setActivePinia(createPinia())
})

describe('settings store', () => {
  it('persists a trimmed nickname and ignores blanks', async () => {
    const s = useSettingsStore()
    await s.load()
    expect(s.nickname).toBe('')
    await s.setNickname('  ')
    await s.setNickname(' Jinx ')
    expect(s.nickname).toBe('Jinx')
    expect(await storage.getNickname()).toBe('Jinx')
  })
})

describe('matches store', () => {
  it('persists after every action', async () => {
    const m = useMatchesStore()
    await m.load()
    const { id } = await m.startMatch(['Me', 'Opp'], 0)
    expect((await storage.getMatch(id))?.actions).toHaveLength(0)

    await m.score({ player: 0, type: 'hold', battlefield: 'mine' })
    expect((await storage.getMatch(id))?.actions).toHaveLength(1)
    await m.special(1)
    await m.passTurn()
    expect((await storage.getMatch(id))?.actions).toHaveLength(3)
    await m.pause()
    expect((await storage.getMatch(id))?.pauses).toHaveLength(1)
    await m.resumeTimer()
    expect((await storage.getMatch(id))?.pauses[0].to).toBeDefined()
    expect(await m.undo()).not.toBeNull()
    expect((await storage.getMatch(id))?.actions).toHaveLength(2)
  })

  it('persists resign and undo of it', async () => {
    const m = useMatchesStore()
    await m.load()
    const { id } = await m.startMatch(['Me', 'Opp'], 0)
    await m.special(0)
    await m.resign(0)
    const saved = await storage.getMatch(id)
    expect(saved?.winner).toBe(1)
    expect(saved?.endedAt).toBeDefined()
    expect(saved?.actions.at(-1)?.kind).toBe('resign')
    expect(m.activeState?.resigned).toBe(true)
    await expect(m.resign(1)).rejects.toThrow()
    expect((await storage.getMatch(id))?.actions).toHaveLength(2)
    expect((await m.undo())?.kind).toBe('resign')
    const reopened = await storage.getMatch(id)
    expect(reopened?.winner).toBeUndefined()
    expect(reopened?.endedAt).toBeUndefined()
    expect(m.activeState?.isOver).toBe(false)
  })

  it('resumes an unfinished match on load and keeps finished ones in history', async () => {
    const first = useMatchesStore()
    await first.load()
    const { id } = await first.startMatch(['Me', 'Opp'], 1)
    await first.score({ player: 1, type: 'special' })

    setActivePinia(createPinia())
    const second = useMatchesStore()
    await second.load()
    expect(second.active?.id).toBe(id)
    expect(second.active?.actions).toHaveLength(1)
    expect(second.unfinished?.id).toBe(id)

    for (let i = 0; i < 7; i++) await second.special(1)
    expect(second.activeState?.isOver).toBe(true)
    expect(second.unfinished).toBeNull()

    setActivePinia(createPinia())
    const third = useMatchesStore()
    await third.load()
    expect(third.active).toBeNull()
    expect(third.history).toHaveLength(1)
    expect(third.history[0].winner).toBe(1)
  })

  it('never keeps two unfinished matches', async () => {
    const m = useMatchesStore()
    await m.load()
    const a = await m.startMatch(['Me', 'Opp'], 0)
    const b = await m.startMatch(['Me', 'Opp2'], 1)
    expect(m.history.filter((x) => x.endedAt === undefined)).toHaveLength(1)
    expect(m.unfinished?.id).toBe(b.id)
    expect(await storage.getMatch(a.id)).toBeFalsy()
  })

  it('deletes matches from history and storage', async () => {
    const m = useMatchesStore()
    await m.load()
    const { id } = await m.startMatch(['Me', 'Opp'], 0)
    await m.remove(id)
    expect(m.history).toHaveLength(0)
    expect(m.active).toBeNull()
    expect(await storage.getMatch(id)).toBeUndefined()
  })
})
