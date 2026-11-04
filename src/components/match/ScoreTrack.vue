<script setup lang="ts">
import { WIN_SCORE } from '../../game'

defineProps<{ score: number }>()
const steps = Array.from({ length: WIN_SCORE + 1 }, (_, i) => WIN_SCORE - i) // 8 at the top, 0 at the bottom
</script>

<template>
  <ol class="flex h-full w-9 flex-col justify-between gap-1 py-1" aria-label="Score track">
    <li
      v-for="n in steps"
      :key="n"
      class="flex flex-1 items-center justify-center rounded text-sm font-semibold"
      :class="n === score ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'"
      :aria-current="n === score ? 'true' : undefined"
    >
      {{ n }}
    </li>
  </ol>
</template>
