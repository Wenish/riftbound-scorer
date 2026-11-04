<script setup lang="ts">
// Contract: live match screen for matches.active (App only shows it while one exists).
// Reads: matches.active, useNow() from stores/clock for timers (deriveState at `now`).
// Calls: matches.score / special / passTurn / undo / pause / resumeTimer.
// Leave: matches.closeActive() then nav.navigate('home').
// No props / emits. The update prompt is hidden while this view is shown.
// Layout: top half (player 1) is wrapped in `rotate-180`; the popup panel is rotated for player 1.
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import PlayerHalf from '../components/match/PlayerHalf.vue'
import ResultOverlay from '../components/match/ResultOverlay.vue'
import ScoreTrack from '../components/match/ScoreTrack.vue'
import ScorePopup from '../components/match/ScorePopup.vue'
import {
  deriveState,
  describeAction,
  formatDuration,
  pointLog,
  scoredBattlefields,
  type Battlefield,
  type PlayerIndex,
  type ScoreType,
} from '../game'
import { keepAwake, release } from '../platform/wakeLock'
import { useNow } from '../stores/clock'
import { useMatchesStore } from '../stores/matches'
import { useNavStore } from '../stores/nav'

const matches = useMatchesStore()
const nav = useNavStore()
const now = useNow()

const match = computed(() => matches.active)
const state = computed(() => (match.value ? deriveState(match.value, now.value) : null))
const turnDuration = computed(() => state.value?.turns[state.value.turns.length - 1]?.duration ?? 0)

const popup = ref<{ player: PlayerIndex; type: Exclude<ScoreType, 'special'> } | null>(null)
const toast = ref<{ player: PlayerIndex; text: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | undefined

function hintFor(player: PlayerIndex): string | null {
  const h = state.value?.finalPointHint
  if (!h || h.player !== player) return null
  const where = h.battlefield === 'mine' ? 'your own battlefield' : "the opponent's battlefield"
  return `Final point: score ${where} this turn to win`
}

async function guarded(fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn()
  } catch {
    // Game rule errors (e.g. match already over) are ignored; the UI reflects the store state.
  }
}

async function confirmScore(bf: Battlefield, turn: number): Promise<void> {
  const p = popup.value
  popup.value = null
  if (p) await guarded(() => matches.score({ player: p.player, type: p.type, battlefield: bf, turn }))
}

async function undo(player: PlayerIndex): Promise<void> {
  const m = match.value
  const undone = await matches.undo()
  if (!undone || !m) return
  toast.value = { player, text: `Undid: ${describeAction(m, undone)}` }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 3500)
}

function leave(): void {
  matches.closeActive()
  nav.navigate('home')
}

const isOver = computed(() => state.value?.isOver ?? false)
watch(isOver, (over) => void (over ? release() : keepAwake()))
onMounted(() => void keepAwake())
onUnmounted(() => {
  clearTimeout(toastTimer)
  void release()
})

const players: PlayerIndex[] = [1, 0] // render order: top (rotated) first
</script>

<template>
  <section v-if="match && state" class="flex h-dvh overflow-hidden bg-slate-950">
    <!-- Shared score track: one upright column, outside the rotated top half -->
    <ScoreTrack :scores="[state.scores[0], state.scores[1]]" :events="[pointLog(match, 0), pointLog(match, 1)]" />
    <div class="flex min-w-0 flex-1 flex-col">
    <!-- Top half faces the opponent: rotated 180° -->
    <div class="min-h-0 flex-1 rotate-180 overflow-hidden">
      <PlayerHalf
        :player="1"
        :opponent-name="match.players[0].name"
        :name="match.players[1].name"
        :score="state.scores[1]"
        :active="!state.isOver && state.activePlayer === 1"
        :hint="hintFor(1)"
        :toast="toast?.player === 1 ? toast.text : null"
        :disabled="state.isOver"
        @conquer="popup = { player: 1, type: 'conquer' }"
        @hold="popup = { player: 1, type: 'hold' }"
        @special="guarded(() => matches.special(1))"
        @pass="guarded(() => matches.passTurn())"
        @undo="undo(1)"
        @resign="guarded(() => matches.resign(1))"
      />
    </div>

    <!-- Centre divider: timers duplicated so both players can read them -->
    <div class="flex h-14 shrink-0 items-center justify-between gap-2 border-y border-slate-600 bg-slate-950 px-3">
      <div v-for="rot in [true, false]" :key="String(rot)" class="text-center leading-tight" :class="rot ? 'rotate-180' : ''">
        <div class="text-xs text-slate-400">Turn {{ state.currentTurn }} · {{ formatDuration(turnDuration) }}</div>
        <div class="text-lg font-bold tabular-nums">{{ formatDuration(state.gameDuration) }}</div>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="min-h-11 min-w-11 rounded-lg bg-slate-700 px-3 text-sm font-semibold disabled:opacity-40"
          :disabled="state.isOver"
          @click="guarded(() => (state!.isPaused ? matches.resumeTimer() : matches.pause()))"
        >
          {{ state.isPaused ? 'Resume' : 'Pause' }}
        </button>
        <button type="button" class="min-h-11 min-w-11 rounded-lg bg-slate-700 px-3 text-sm font-semibold" @click="leave">
          Home
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-hidden">
      <PlayerHalf
        :player="0"
        :opponent-name="match.players[1].name"
        :name="match.players[0].name"
        :score="state.scores[0]"
        :active="!state.isOver && state.activePlayer === 0"
        :hint="hintFor(0)"
        :toast="toast?.player === 0 ? toast.text : null"
        :disabled="state.isOver"
        @conquer="popup = { player: 0, type: 'conquer' }"
        @hold="popup = { player: 0, type: 'hold' }"
        @special="guarded(() => matches.special(0))"
        @pass="guarded(() => matches.passTurn())"
        @undo="undo(0)"
        @resign="guarded(() => matches.resign(0))"
      />
    </div>

    </div>

    <!-- Score pop-up: panel sits in the opener's half, rotated for the top player; outside tap cancels -->
    <div v-if="popup" class="fixed inset-0 z-30 flex flex-col bg-slate-950/70" @click.self="popup = null">
      <div
        v-for="p in players"
        :key="p"
        class="flex min-h-0 flex-1 items-center justify-center p-4"
        :class="p === 1 ? 'rotate-180' : ''"
        @click.self="popup = null"
      >
        <ScorePopup
          v-if="popup.player === p"
          :type="popup.type"
          :current-turn="state.currentTurn"
          :scored-in="(t) => scoredBattlefields(match?.actions ?? [], p, t)"
          @confirm="confirmScore"
          @cancel="popup = null"
        />
      </div>
    </div>

    <ResultOverlay
      v-if="state.isOver && state.winner !== null"
      :winner-name="match.players[state.winner].name"
      :names="[match.players[0].name, match.players[1].name]"
      :scores="state.scores"
      :resigned-name="state.resigned ? match.players[1 - state.winner as PlayerIndex].name : null"
      @home="leave"
      @undo="undo(state.winner)"
    />
  </section>
</template>
