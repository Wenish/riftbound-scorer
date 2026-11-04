import type { Match } from '../game/types'

export interface StorageAdapter {
  getNickname(): Promise<string | undefined>
  setNickname(nickname: string): Promise<void>
  /** All matches, newest first (by createdAt). */
  listMatches(): Promise<Match[]>
  getMatch(id: string): Promise<Match | undefined>
  /** Upsert in one atomic transaction. */
  saveMatch(match: Match): Promise<void>
  deleteMatch(id: string): Promise<void>
  /** The most recent match without `endedAt`, if any. */
  getUnfinishedMatch(): Promise<Match | undefined>
}
