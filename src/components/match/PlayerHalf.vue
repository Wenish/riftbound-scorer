<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PlayerIndex } from '../../game'

const props = defineProps<{
  name: string
  score: number
  active: boolean
  hint: string | null
  toast: string | null
  disabled: boolean
  scoreDisabled: boolean
  passDisabled: boolean
  player: PlayerIndex
  opponentName: string
}>()
const emit = defineEmits<{ conquer: []; hold: []; special: []; pass: []; undo: []; resign: [] }>()
const confirming = ref(false)
function confirmResign() {
  confirming.value = false
  emit('resign')
}

const notice = ref<{ text: string; kind: 'score' | 'pass' } | null>(null)
const SCORE_MSG = 'You already scored both battlefields this turn.'
const PASS_MSG = "It's not your turn."
function tapScore(ev: 'conquer' | 'hold') {
  if (props.scoreDisabled) notice.value = { text: SCORE_MSG, kind: 'score' }
  else if (ev === 'conquer') emit('conquer')
  else emit('hold')
}
function tapPass() {
  if (props.passDisabled) notice.value = { text: PASS_MSG, kind: 'pass' }
  else emit('pass')
}
watch(() => props.scoreDisabled, (v) => { if (!v && notice.value?.kind === 'score') notice.value = null })
watch(() => props.passDisabled, (v) => { if (!v && notice.value?.kind === 'pass') notice.value = null })
watch(() => props.disabled, (v) => { if (v) notice.value = null })

const scoreBtn = (color: string) => [btn, props.scoreDisabled ? 'bg-slate-700 text-slate-500' : color]
const btn = 'min-h-10 rounded-lg px-1 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500'
</script>

<template>
  <div
    class="relative flex h-full min-h-0 flex-col gap-1.5 overflow-hidden p-1.5"
    :class="active ? 'bg-slate-800/60 ring-2 ring-inset ring-amber-400' : 'bg-slate-900'"
    :data-player="player"
  >
    <div class="flex shrink-0 items-center justify-between gap-2">
      <h2 class="flex min-w-0 items-center gap-1.5 truncate text-base font-bold"><span class="size-2.5 shrink-0 rounded-full" :class="player === 1 ? 'bg-rose-400' : 'bg-sky-400'" aria-hidden="true" />{{ name }}</h2>
      <div class="flex shrink-0 items-center gap-1.5">
        <span v-if="active" class="rounded bg-amber-400 whitespace-nowrap px-2 py-0.5 text-xs font-bold text-slate-950">YOUR TURN</span>
        <button
          type="button"
          class="min-h-11 rounded-lg px-3 text-xs font-medium text-slate-400 underline-offset-2 hover:underline disabled:opacity-40"
          :disabled="disabled"
          @click="confirming = true"
        >
          Resign
        </button>
      </div>
    </div>
    <p v-if="hint" class="line-clamp-2 shrink-0 rounded-lg bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200" role="status">{{ hint }}</p>
    <div class="min-h-0 flex-1">
      <div v-if="notice" class="flex items-center gap-1 rounded-lg bg-slate-100 pl-2 text-xs font-medium text-slate-900" role="status">
        <span class="min-w-0 flex-1">{{ notice.text }}</span>
        <button type="button" class="flex size-11 shrink-0 items-center justify-center text-base" aria-label="Dismiss" @click="notice = null">&times;</button>
      </div>
    </div>
    <p v-if="toast" class="line-clamp-2 shrink-0 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-900" role="status">
      {{ toast }}
    </p>
    <div class="grid shrink-0 grid-cols-3 gap-1.5">
      <button type="button" :class="scoreBtn('bg-sky-500 text-slate-950')" :disabled="disabled" :aria-disabled="scoreDisabled || undefined" @click="tapScore('conquer')">Conquer</button>
      <button type="button" :class="scoreBtn('bg-indigo-400 text-slate-950')" :disabled="disabled" :aria-disabled="scoreDisabled || undefined" @click="tapScore('hold')">Hold</button>
      <button type="button" :class="[btn, 'bg-fuchsia-400 text-slate-950']" :disabled="disabled" @click="emit('special')">Special +1</button>
      <button type="button" :class="[btn, ['col-span-2', passDisabled ? 'bg-slate-700 text-slate-500' : 'bg-slate-600']]" :disabled="disabled" :aria-disabled="passDisabled || undefined" @click="tapPass">Pass Turn</button>
      <button type="button" :class="[btn, 'bg-slate-700']" @click="emit('undo')">Undo</button>
    </div>
    <div v-if="confirming" class="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/90 p-3" role="dialog" aria-modal="true">
      <div class="w-full max-w-xs rounded-xl border border-slate-500 bg-slate-900 p-3 text-center">
        <p class="mb-3 text-base font-semibold">Resign? {{ opponentName }} wins</p>
        <div class="flex gap-2">
          <button type="button" class="min-h-11 flex-1 rounded-lg border border-slate-500" @click="confirming = false">Cancel</button>
          <button type="button" class="min-h-11 flex-1 rounded-lg bg-red-500 font-bold text-white" @click="confirmResign">Resign</button>
        </div>
      </div>
    </div>
  </div>
</template>
