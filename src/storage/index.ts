import { createIndexedDbStorage } from './indexeddb'
import { createMemoryStorage } from './memory'
import type { StorageAdapter } from './types'

export type { StorageAdapter } from './types'

export async function createStorage(): Promise<StorageAdapter> {
  try {
    const { isTauri } = await import('@tauri-apps/api/core')
    if (isTauri()) {
      const { createSqliteStorage } = await import('./sqlite')
      return await createSqliteStorage()
    }
  } catch (e) {
    console.warn('SQLite unavailable, falling back to browser storage', e)
  }

  try {
    if (typeof indexedDB !== 'undefined') return await createIndexedDbStorage()
  } catch (e) {
    console.warn('IndexedDB unavailable, falling back to in-memory storage', e)
  }
  return createMemoryStorage()
}
