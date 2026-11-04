<script setup lang="ts">
// One shared vertical track for both players, never rotated.
// Top player (1) climbs 0 -> 7 from the top edge, bottom player (0) from the bottom edge;
// the single "8" (win) sits in the middle cell, aligned with the centre divider.
import { WIN_SCORE } from '../../game'

defineProps<{ scores: [number, number] }>()
const lower = Array.from({ length: WIN_SCORE }, (_, i) => i) // 0..7
const topSteps = lower // rendered top -> centre: 0..7
const bottomSteps = [...lower].reverse() // rendered centre -> bottom: 7..0

const topCls = 'bg-rose-400 text-slate-950'
const bottomCls = 'bg-sky-400 text-slate-950'
const idle = 'bg-slate-800 text-slate-500'
</script>

<template>
  <div class="flex h-full w-9 shrink-0 flex-col bg-slate-950 px-0.5" role="group" aria-label="Score track">
    <ol class="flex min-h-0 flex-1 flex-col gap-px py-0.5" aria-label="Top player score">
      <li
        v-for="n in topSteps"
        :key="n"
        class="flex min-h-0 flex-1 items-center justify-center rounded text-xs font-semibold leading-none"
        :class="n === scores[1] ? topCls : idle"
        :aria-current="n === scores[1] ? 'true' : undefined"
      >
        {{ n }}
      </li>
    </ol>
    <div
      class="flex h-14 shrink-0 items-center justify-center rounded text-base font-bold"
      :class="scores[1] >= WIN_SCORE ? topCls : scores[0] >= WIN_SCORE ? bottomCls : 'bg-amber-400 text-slate-950'"
    >
      {{ WIN_SCORE }}
    </div>
    <ol class="flex min-h-0 flex-1 flex-col gap-px py-0.5" aria-label="Bottom player score">
      <li
        v-for="n in bottomSteps"
        :key="n"
        class="flex min-h-0 flex-1 items-center justify-center rounded text-xs font-semibold leading-none"
        :class="n === scores[0] ? bottomCls : idle"
        :aria-current="n === scores[0] ? 'true' : undefined"
      >
        {{ n }}
      </li>
    </ol>
  </div>
</template>
