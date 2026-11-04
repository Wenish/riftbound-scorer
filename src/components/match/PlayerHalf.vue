<script setup lang="ts">
import type { PlayerIndex, ScoreEvent } from '../../game'
import ScoreLog from './ScoreLog.vue'
import ScoreTrack from './ScoreTrack.vue'

defineProps<{
  name: string
  score: number
  events: ScoreEvent[]
  active: boolean
  hint: string | null
  toast: string | null
  disabled: boolean
  player: PlayerIndex
}>()
const emit = defineEmits<{ conquer: []; hold: []; special: []; pass: []; undo: [] }>()

const btn = 'min-h-12 rounded-lg px-2 text-base font-semibold disabled:opacity-40'
</script>

<template>
  <div
    class="relative flex h-full min-h-0 flex-col gap-2 p-2"
    :class="active ? 'bg-slate-800/60 ring-2 ring-inset ring-amber-400' : 'bg-slate-900'"
    :data-player="player"
  >
    <div class="flex items-center justify-between">
      <h2 class="truncate text-lg font-bold">{{ name }}</h2>
      <span v-if="active" class="rounded bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-950">TURN</span>
    </div>
    <p v-if="hint" class="rounded-lg bg-amber-500/20 px-2 py-1 text-sm text-amber-200" role="status">{{ hint }}</p>
    <div class="flex min-h-0 flex-1 gap-2">
      <ScoreTrack :score="score" />
      <ScoreLog :events="events" />
    </div>
    <p v-if="toast" class="rounded-lg bg-slate-100 px-2 py-1 text-sm font-medium text-slate-900" role="status">
      {{ toast }}
    </p>
    <div class="grid grid-cols-3 gap-2">
      <button type="button" :class="[btn, 'bg-sky-500 text-slate-950']" :disabled="disabled" @click="emit('conquer')">Conquer</button>
      <button type="button" :class="[btn, 'bg-indigo-400 text-slate-950']" :disabled="disabled" @click="emit('hold')">Hold</button>
      <button type="button" :class="[btn, 'bg-fuchsia-400 text-slate-950']" :disabled="disabled" @click="emit('special')">Special +1</button>
      <button type="button" :class="[btn, 'col-span-2 bg-slate-600']" :disabled="disabled" @click="emit('pass')">Pass Turn</button>
      <button type="button" :class="[btn, 'bg-slate-700']" @click="emit('undo')">Undo</button>
    </div>
  </div>
</template>
