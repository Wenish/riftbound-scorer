<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Battlefield, ScoreType } from '../../game'
import NumPad from './NumPad.vue'

const props = defineProps<{
  type: Exclude<ScoreType, 'special'>
  currentTurn: number
  /** Battlefields the popup's player already scored in the given turn. */
  scoredIn: (turn: number) => Battlefield[]
}>()
const emit = defineEmits<{ confirm: [battlefield: Battlefield, turn: number]; cancel: [] }>()

const battlefield = ref<Battlefield | null>(null)
const turn = ref(props.currentTurn)
const padOpen = ref(false)
const alreadyScored = computed(
  () => battlefield.value !== null && props.scoredIn(turn.value).includes(battlefield.value),
)
const canConfirm = computed(() => battlefield.value !== null && !alreadyScored.value)

function confirm() {
  if (battlefield.value) emit('confirm', battlefield.value, turn.value)
}

const seg = (active: boolean) =>
  `min-h-12 flex-1 rounded-lg px-2 text-base font-semibold ${active ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-100'}`
</script>

<template>
  <div class="m-auto w-full max-w-sm rounded-2xl border border-slate-600 bg-slate-900 p-4 shadow-xl" role="dialog" aria-modal="true">
    <h2 class="mb-3 text-center text-lg font-semibold capitalize">{{ type }}</h2>
    <NumPad
      v-if="padOpen"
      :max="currentTurn"
      :initial="turn"
      @confirm="(v) => ((turn = v), (padOpen = false))"
      @cancel="padOpen = false"
    />
    <div v-else class="flex flex-col gap-3">
      <p class="text-center text-sm text-slate-400">Which battlefield was scored?</p>
      <div class="flex gap-2" role="group" aria-label="Battlefield">
        <button type="button" :class="seg(battlefield === 'mine')" @click="battlefield = 'mine'">My battlefield</button>
        <button type="button" :class="seg(battlefield === 'opponent')" @click="battlefield = 'opponent'">
          Opponent's battlefield
        </button>
      </div>
      <button
        type="button"
        class="flex min-h-12 items-center justify-between rounded-lg bg-slate-800 px-4 text-base"
        @click="padOpen = true"
      >
        <span class="text-slate-400">Turn</span>
        <span class="text-xl font-semibold" :class="turn !== currentTurn ? 'text-amber-300' : ''">{{ turn }}</span>
      </button>
      <p
        v-if="alreadyScored"
        class="rounded-lg bg-amber-500/20 px-3 py-2 text-sm text-amber-200"
        role="status"
      >
        You already scored {{ battlefield === 'mine' ? 'your' : "the opponent's" }} battlefield this turn. Each
        battlefield can only be scored once per turn.
      </p>
      <button
        type="button"
        class="min-h-12 rounded-lg bg-emerald-500 text-base font-bold text-slate-950 disabled:opacity-40"
        :disabled="!canConfirm"
        @click="confirm"
      >
        Score Point +1
      </button>
      <button type="button" class="min-h-11 rounded-lg text-slate-300" @click="emit('cancel')">Cancel</button>
    </div>
  </div>
</template>
