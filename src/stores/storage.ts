import { createStorage, type StorageAdapter } from '../storage'

let pending: Promise<StorageAdapter> | undefined

/** Shared storage adapter for all stores (created lazily, once). */
export function getStorage(): Promise<StorageAdapter> {
  pending ??= createStorage()
  return pending
}

/** Test hook: replace (or reset with undefined) the shared adapter. */
export function setStorage(adapter: StorageAdapter | undefined): void {
  pending = adapter ? Promise.resolve(adapter) : undefined
}
