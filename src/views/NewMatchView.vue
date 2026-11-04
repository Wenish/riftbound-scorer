<script setup lang="ts">
// Contract: start a match. Reads useSettingsStore (nickname default); calls
// matches.startMatch(names, first) then nav.navigate('match'); Back -> nav.navigate('home').
import { ref } from 'vue'
import type { PlayerIndex } from '../game'
import { useMatchesStore } from '../stores/matches'
import { useNavStore } from '../stores/nav'
import { useSettingsStore } from '../stores/settings'

const matches = useMatchesStore()
const nav = useNavStore()
const settings = useSettingsStore()

const names = ref<[string, string]>([settings.nickname || 'Your Name', 'Frenemy'])
const first = ref<PlayerIndex>(0)
const starting = ref(false)

async function start() {
  if (starting.value) return
  starting.value = true
  const n: [string, string] = [names.value[0].trim() || 'Your Name', names.value[1].trim() || 'Frenemy']
  await matches.startMatch(n, first.value)
  nav.navigate('match')
}

const inputClass =
  'min-h-12 w-full rounded-lg border-2 border-slate-500 bg-slate-900 px-3 text-center text-lg text-white focus:border-white focus:outline-none'
</script>

<template>
  <section class="mx-auto flex min-h-safe-dvh max-w-md flex-col gap-6 p-4">
    <header class="flex items-center gap-3">
      <button type="button" class="min-h-11 rounded-lg border border-slate-500 px-4" @click="nav.navigate('home')">
        Back
      </button>
      <h1 class="text-2xl font-bold">New Match</h1>
    </header>

    <div class="flex flex-col items-center gap-2">
      <input v-model="names[0]" maxlength="30" aria-label="Your name" :class="inputClass" />
      <span class="text-slate-300">vs.</span>
      <input v-model="names[1]" maxlength="30" aria-label="Opponent name" :class="inputClass" />
      <p class="text-sm text-slate-300">Tap a name to edit it for this match only.</p>
    </div>

    <fieldset>
      <legend class="mb-2 font-bold">Who goes first?</legend>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="i in [0, 1] as PlayerIndex[]"
          :key="i"
          type="button"
          :aria-pressed="first === i"
          class="min-h-12 truncate rounded-lg border-2 px-3 font-bold"
          :class="first === i ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-500 text-slate-100'"
          @click="first = i"
        >
          {{ names[i].trim() || (i === 0 ? 'Your Name' : 'Frenemy') }}
        </button>
      </div>
    </fieldset>

    <button
      type="button"
      :disabled="starting"
      class="mt-auto min-h-14 rounded-lg bg-emerald-500 text-xl font-bold text-slate-950 disabled:opacity-40"
      @click="start"
    >
      Start
    </button>
  </section>
</template>
