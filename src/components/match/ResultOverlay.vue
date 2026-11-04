<script setup lang="ts">
defineProps<{ winnerName: string; scores: [number, number]; names: [string, string]; resignedName?: string | null }>()
const emit = defineEmits<{ home: []; undo: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-40 flex overflow-y-auto bg-slate-950/90 p-6" role="dialog" aria-modal="true">
    <div class="m-auto w-full max-w-sm rounded-2xl border border-amber-400 bg-slate-900 p-6 text-center">
      <p class="text-sm uppercase tracking-wide text-slate-400">Winner</p>
      <h2 class="mt-1 text-3xl font-bold text-amber-300">{{ winnerName }}</h2>
      <p v-if="resignedName" class="mt-2 text-base text-slate-300">{{ resignedName }} resigned</p>
      <p class="mt-3 text-lg">{{ names[0] }} {{ scores[0] }} : {{ scores[1] }} {{ names[1] }}</p>
      <div class="mt-6 flex flex-col gap-2">
        <button type="button" class="min-h-12 rounded-lg bg-amber-400 font-bold text-slate-950" @click="emit('home')">
          Back to Home
        </button>
        <button type="button" class="min-h-11 rounded-lg bg-slate-700" @click="emit('undo')">{{ resignedName ? 'Undo resignation' : 'Undo last point' }}</button>
      </div>
    </div>
  </div>
</template>
