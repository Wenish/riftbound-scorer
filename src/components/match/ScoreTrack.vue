<script setup lang="ts">
// One shared vertical track for both players, never rotated.
// Top player (1) climbs 0 -> 7 from the top edge, bottom player (0) from the bottom edge;
// the single "8" (win) sits in the middle cell, aligned with the centre divider.
// Each row also shows the score codes that produced that step (SPEC 3.4).
import { computed } from 'vue'
import { WIN_SCORE, scoreCode, type ScoreEvent } from '../../game'

const props = defineProps<{ scores: [number, number]; events: [ScoreEvent[], ScoreEvent[]] }>()
const lower = Array.from({ length: WIN_SCORE }, (_, i) => i) // 0..7
const topSteps = lower // rendered top -> centre: 0..7
const bottomSteps = [...lower].reverse() // rendered centre -> bottom: 7..0

/** rows[player][n]: codes shown on step n. The k-th awarded event lands on row k; denied events on the current row. */
const rows = computed(() =>
  props.events.map((list) => {
    const out: { code: string; denied: boolean }[][] = Array.from({ length: WIN_SCORE + 1 }, () => [])
    let n = 0
    for (const e of list) {
      if (e.pointAwarded) n = Math.min(n + 1, WIN_SCORE)
      out[n].push({ code: scoreCode(e), denied: !e.pointAwarded })
    }
    return out
  }),
)
const winCodes = computed(() => (props.scores[1] >= WIN_SCORE ? rows.value[1] : rows.value[0])[WIN_SCORE])

const topCls = 'bg-rose-400 text-slate-950'
const bottomCls = 'bg-sky-400 text-slate-950'
const idle = 'bg-slate-800 text-slate-500'
</script>

<template>
  <div class="flex h-full w-24 shrink-0 flex-col bg-slate-950 px-0.5" role="group" aria-label="Score track">
    <ol class="flex min-h-0 flex-1 flex-col gap-px py-0.5" aria-label="Top player score">
      <li
        v-for="n in topSteps"
        :key="n"
        class="flex min-h-0 flex-1 items-center gap-1 overflow-hidden rounded px-1 text-xs leading-none"
        :class="n === scores[1] ? topCls : idle"
        :aria-current="n === scores[1] ? 'true' : undefined"
      >
        <span class="w-3 shrink-0 text-center font-semibold">{{ n }}</span>
        <span class="min-w-0 flex-1 truncate whitespace-nowrap font-mono">
          <template v-for="(c, i) in rows[1][n]" :key="i"
            ><span :class="c.denied ? 'line-through opacity-60' : 'text-slate-100'" :style="n === scores[1] ? { color: 'inherit' } : undefined">{{ c.code }}</span
            >{{ ' ' }}</template
          >
        </span>
      </li>
    </ol>
    <div
      class="flex h-14 shrink-0 items-center gap-1 overflow-hidden rounded px-1 text-base font-bold"
      :class="scores[1] >= WIN_SCORE ? topCls : scores[0] >= WIN_SCORE ? bottomCls : 'bg-amber-400 text-slate-950'"
    >
      <span class="w-3 shrink-0 text-center">{{ WIN_SCORE }}</span>
      <span class="min-w-0 flex-1 truncate whitespace-nowrap font-mono text-xs font-semibold">
        <template v-for="(c, i) in winCodes" :key="i"
          ><span :class="c.denied ? 'line-through opacity-60' : ''">{{ c.code }}</span
          >{{ ' ' }}</template
        >
      </span>
    </div>
    <ol class="flex min-h-0 flex-1 flex-col gap-px py-0.5" aria-label="Bottom player score">
      <li
        v-for="n in bottomSteps"
        :key="n"
        class="flex min-h-0 flex-1 items-center gap-1 overflow-hidden rounded px-1 text-xs leading-none"
        :class="n === scores[0] ? bottomCls : idle"
        :aria-current="n === scores[0] ? 'true' : undefined"
      >
        <span class="w-3 shrink-0 text-center font-semibold">{{ n }}</span>
        <span class="min-w-0 flex-1 truncate whitespace-nowrap font-mono">
          <template v-for="(c, i) in rows[0][n]" :key="i"
            ><span :class="c.denied ? 'line-through opacity-60' : 'text-slate-100'" :style="n === scores[0] ? { color: 'inherit' } : undefined">{{ c.code }}</span
            >{{ ' ' }}</template
          >
        </span>
      </li>
    </ol>
  </div>
</template>
