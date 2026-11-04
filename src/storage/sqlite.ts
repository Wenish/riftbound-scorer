import type { Match } from '../game/types'
import type { StorageAdapter } from './types'

const NICKNAME_KEY = 'nickname'

interface MatchRow {
  data: string
}

/** Opens the SQLite database via tauri-plugin-sql (lazy-imported; Tauri only). */
export async function createSqliteStorage(dbUrl = 'sqlite:riftbound-scorer.db'): Promise<StorageAdapter> {
  const { default: Database } = await import('@tauri-apps/plugin-sql')
  const db = await Database.load(dbUrl)
  await db.execute('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  await db.execute(
    'CREATE TABLE IF NOT EXISTS matches (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, ended_at INTEGER, data TEXT NOT NULL)',
  )

  const parse = (r: MatchRow): Match => JSON.parse(r.data) as Match

  return {
    async getNickname() {
      const rows = await db.select<{ value: string }[]>('SELECT value FROM settings WHERE key = $1', [NICKNAME_KEY])
      return rows[0]?.value
    },
    async setNickname(nickname) {
      await db.execute(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [NICKNAME_KEY, nickname],
      )
    },
    async listMatches() {
      const rows = await db.select<MatchRow[]>('SELECT data FROM matches ORDER BY created_at DESC')
      return rows.map(parse)
    },
    async getMatch(id) {
      const rows = await db.select<MatchRow[]>('SELECT data FROM matches WHERE id = $1', [id])
      return rows[0] ? parse(rows[0]) : undefined
    },
    async saveMatch(match) {
      // Single-statement upsert is atomic.
      await db.execute(
        `INSERT INTO matches (id, created_at, ended_at, data) VALUES ($1, $2, $3, $4)
         ON CONFLICT(id) DO UPDATE SET created_at = excluded.created_at, ended_at = excluded.ended_at, data = excluded.data`,
        [match.id, match.createdAt, match.endedAt ?? null, JSON.stringify(match)],
      )
    },
    async deleteMatch(id) {
      await db.execute('DELETE FROM matches WHERE id = $1', [id])
    },
    async getUnfinishedMatch() {
      const rows = await db.select<MatchRow[]>(
        'SELECT data FROM matches WHERE ended_at IS NULL ORDER BY created_at DESC LIMIT 1',
      )
      return rows[0] ? parse(rows[0]) : undefined
    },
  }
}
