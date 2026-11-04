import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Match } from '../game/types'
import { createIndexedDbStorage } from './indexeddb'
import { createMemoryStorage } from './memory'
import type { StorageAdapter } from './types'

const mk = (id: string, createdAt: number, extra: Partial<Match> = {}): Match =>
  ({
    id,
    createdAt,
    players: [{ name: 'A' }, { name: 'B' }],
    firstPlayer: 0,
    actions: [],
    ...extra,
  }) as Match

let n = 0
const factories: Record<string, () => Promise<StorageAdapter>> = {
  memory: async () => createMemoryStorage(),
  indexeddb: () => createIndexedDbStorage(`test-${n++}`),
}

describe.each(Object.keys(factories))('StorageAdapter contract: %s', (name) => {
  let s: StorageAdapter
  beforeEach(async () => {
    s = await factories[name]!()
  })

  it('stores the nickname', async () => {
    expect(await s.getNickname()).toBeUndefined()
    await s.setNickname('Jonas')
    expect(await s.getNickname()).toBe('Jonas')
  })

  it('lists matches newest first', async () => {
    await s.saveMatch(mk('a', 1, { endedAt: 5 }))
    await s.saveMatch(mk('b', 3, { endedAt: 5 }))
    await s.saveMatch(mk('c', 2, { endedAt: 5 }))
    expect((await s.listMatches()).map((m) => m.id)).toEqual(['b', 'c', 'a'])
  })

  it('upserts and gets by id', async () => {
    await s.saveMatch(mk('a', 1))
    await s.saveMatch(mk('a', 1, { endedAt: 9 }))
    expect(await s.listMatches()).toHaveLength(1)
    expect((await s.getMatch('a'))?.endedAt).toBe(9)
    expect(await s.getMatch('zzz')).toBeUndefined()
  })

  it('deletes', async () => {
    await s.saveMatch(mk('a', 1))
    await s.deleteMatch('a')
    expect(await s.getMatch('a')).toBeUndefined()
    await s.deleteMatch('a')
  })

  it('finds the unfinished match', async () => {
    expect(await s.getUnfinishedMatch()).toBeUndefined()
    await s.saveMatch(mk('done', 5, { endedAt: 6 }))
    await s.saveMatch(mk('open', 2))
    expect((await s.getUnfinishedMatch())?.id).toBe('open')
    await s.saveMatch(mk('open', 2, { endedAt: 7 }))
    expect(await s.getUnfinishedMatch()).toBeUndefined()
  })
})
