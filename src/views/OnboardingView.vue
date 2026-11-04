<script setup lang="ts">
// Contract: first launch. Reads/writes useSettingsStore (nickname); then nav.navigate('home').
import { ref } from 'vue'
import { useNavStore } from '../stores/nav'
import { useSettingsStore } from '../stores/settings'

const nav = useNavStore()
const settings = useSettingsStore()
const name = ref(settings.nickname)

async function confirm() {
  if (!name.value.trim()) return
  await settings.setNickname(name.value)
  nav.navigate('home')
}
</script>

<template>
  <section class="mx-auto flex min-h-safe-dvh max-w-md flex-col justify-center gap-6 p-6">
    <h1 class="text-center text-3xl font-bold">Hello Riftbounder</h1>
    <form class="flex flex-col gap-4" @submit.prevent="confirm">
      <input
        v-model="name"
        type="text"
        maxlength="30"
        placeholder="Your Nickname"
        aria-label="Your Nickname"
        autocomplete="off"
        class="min-h-12 rounded-lg border-2 border-slate-500 bg-slate-900 px-4 text-lg text-white placeholder:text-slate-400 focus:border-white focus:outline-none"
      />
      <button
        type="submit"
        :disabled="!name.trim()"
        class="min-h-12 rounded-lg bg-emerald-500 px-4 text-lg font-bold text-slate-950 disabled:opacity-40"
      >
        Confirm
      </button>
    </form>
  </section>
</template>
