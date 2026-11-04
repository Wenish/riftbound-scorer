<script setup lang="ts">
// Contract: read-only detail of a past match. Reads nav.params.matchId and
// useMatchesStore().history. Back -> nav.navigate('home'). No props / emits.
import { computed } from 'vue'
import { deriveState, formatDuration, pointLog, scoreCode } from '../game'
import { useMatchesStore } from '../stores/matches'
import { useNavStore } from '../stores/nav'

const matches = useMatchesStore()
const nav = useNavStore()

const match = computed(() => matches.history.find((m) => m.id === nav.params.matchId) ?? null)
const state = computed(() => (match.value ? deriveState(match.value, match.value.endedAt ?? Date.now()) : null))
</script>

<template>
  <section class="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4">
    <header class="flex items-center gap-3">
      <button type="button" class="min-h-11 rounded-lg border border-slate-500 px-4" @click="nav.navigate('home')">
        Back
      </button>
      <h1 class="text-2xl font-bold">Match Details</h1>
    </header>

    <p v-if="!match || !state" class="text-slate-300">Match not found.</p>

    <template v-else>
      <div class="rounded-lg border border-slate-600 bg-slate-900 p-3 text-center">
        <p class="text-xl font-bold">
          {{ match.players[0].name }} ({{ state.scores[0] }}) vs ({{ state.scores[1] }}) {{ match.players[1].name }}
        </p>
        <p v-if="state.winner !== null" class="mt-1 text-emerald-400">
          Winner: {{ match.players[state.winner].name }}<span v-if="state.resigned" class="text-amber-400"> · {{ match.players[1 - state.winner as 0 | 1].name }} resigned</span>
        </p>
        <p v-else class="mt-1 text-amber-400">Unfinished</p>
        <p class="mt-1 text-slate-300">Total time {{ formatDuration(state.gameDuration) }}</p>
      </div>

      <div v-for="p in [0, 1] as const" :key="p">
        <h2 class="mb-1 font-bold">{{ match.players[p].name }} score log</h2>
        <p v-if="pointLog(match, p).length === 0" class="text-slate-400">No points.</p>
        <ul class="flex flex-wrap gap-2">
          <li
            v-for="e in pointLog(match, p)"
            :key="e.id"
            class="rounded border px-2 py-1 font-mono"
            :class="e.pointAwarded ? 'border-slate-400' : 'border-slate-600 text-slate-400 line-through'"
            :title="e.pointAwarded ? undefined : 'no point — draw a card'"
          >
            {{ scoreCode(e) }}
          </li>
        </ul>
      </div>

      <div>
        <h2 class="mb-1 font-bold">Turn times</h2>
        <ol class="flex flex-col divide-y divide-slate-700 rounded-lg border border-slate-600">
          <li v-for="t in state.turns" :key="t.number" class="flex justify-between px-3 py-2">
            <span>T{{ t.number }} · {{ match.players[t.activePlayer].name }}</span>
            <span class="font-mono">{{ formatDuration(t.duration) }}</span>
          </li>
        </ol>
      </div>
    </template>
  </section>
</template>
