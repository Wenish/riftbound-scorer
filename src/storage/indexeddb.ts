import { openDB, type DBSchema } from 'idb'
import type { Match } from '../game/types'
import type { StorageAdapter } from './types'

interface ScorerDB extends DBSchema {
  settings: { key: string; value: unknown }
  matches: { key: string; value: Match; indexes: { createdAt: number } }
}

const NICKNAME_KEY = 'nickname'

/** Opens the database; rejects if IndexedDB is unavailable. */
export async function createIndexedDbStorage(dbName = 'riftbound-scorer'): Promise<StorageAdapter> {
  const db = await openDB<ScorerDB>(dbName, 1, {
    upgrade(d) {
      d.createObjectStore('settings')
      const matches = d.createObjectStore('matches', { keyPath: 'id' })
      matches.createIndex('createdAt', 'createdAt')
    },
  })
  // Plain-object copy: Vue reactive proxies can't be structured-cloned by IndexedDB.
  const plain = (m: Match): Match => JSON.parse(JSON.stringify(m))

  return {
    async getNickname() {
      const v = await db.get('settings', NICKNAME_KEY)
      return typeof v === 'string' ? v : undefined
    },
    async setNickname(nickname) {
      await db.put('settings', nickname, NICKNAME_KEY)
    },
    async listMatches() {
      return (await db.getAllFromIndex('matches', 'createdAt')).reverse()
    },
    getMatch(id) {
      return db.get('matches', id)
    },
    async saveMatch(match) {
      await db.put('matches', plain(match))
    },
    async deleteMatch(id) {
      await db.delete('matches', id)
    },
    async getUnfinishedMatch() {
      const all = await db.getAllFromIndex('matches', 'createdAt')
      return all.reverse().find((m) => m.endedAt === undefined)
    },
  }
}
