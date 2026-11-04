import type { Match } from '../game/types'
import type { StorageAdapter } from './types'

export function createMemoryStorage(): StorageAdapter {
  let nickname: string | undefined
  const matches = new Map<string, Match>()
  const clone = (m: Match): Match => structuredClone(m)
  const sorted = () => [...matches.values()].sort((a, b) => b.createdAt - a.createdAt)

  return {
    async getNickname() {
      return nickname
    },
    async setNickname(n) {
      nickname = n
    },
    async listMatches() {
      return sorted().map(clone)
    },
    async getMatch(id) {
      const m = matches.get(id)
      return m && clone(m)
    },
    async saveMatch(match) {
      matches.set(match.id, clone(match))
    },
    async deleteMatch(id) {
      matches.delete(id)
    },
    async getUnfinishedMatch() {
      const m = sorted().find((x) => x.endedAt === undefined)
      return m && clone(m)
    },
  }
}
