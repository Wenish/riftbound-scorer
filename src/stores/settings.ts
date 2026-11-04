import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorage } from './storage'

export const useSettingsStore = defineStore('settings', () => {
  const nickname = ref('')
  const loaded = ref(false)

  async function load(): Promise<void> {
    nickname.value = (await (await getStorage()).getNickname()) ?? ''
    loaded.value = true
  }

  async function setNickname(value: string): Promise<void> {
    const trimmed = value.trim()
    if (!trimmed) return
    await (await getStorage()).setNickname(trimmed)
    nickname.value = trimmed
  }

  return { nickname, loaded, load, setNickname }
})
