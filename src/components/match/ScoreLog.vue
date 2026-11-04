<script setup lang="ts">
import { scoreCode, type ScoreEvent } from '../../game'

defineProps<{ events: ScoreEvent[] }>()
</script>

<template>
  <ul class="flex h-full min-w-0 flex-1 flex-col-reverse gap-1 overflow-y-auto text-sm" aria-label="Score log">
    <li
      v-for="e in [...events].reverse()"
      :key="e.id"
      class="rounded bg-slate-800 px-2 py-1 font-mono"
      :class="e.pointAwarded ? 'text-slate-100' : 'text-slate-500 line-through decoration-slate-500'"
    >
      {{ scoreCode(e) }}
      <span v-if="!e.pointAwarded" class="font-sans text-xs italic no-underline">
        no point — draw a card
      </span>
    </li>
  </ul>
</template>
