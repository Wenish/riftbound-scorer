<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ max: number; initial: number }>()
const emit = defineEmits<{ confirm: [value: number]; cancel: [] }>()

const text = ref('')
const value = () => (text.value === '' ? NaN : Number(text.value))
const valid = () => Number.isInteger(value()) && value() >= 1 && value() <= props.max

function press(d: string): void {
  const next = (text.value + d).replace(/^0+/, '')
  if (next.length <= 3) text.value = next
}
const key = 'min-h-12 rounded-lg bg-slate-700 text-xl font-semibold active:bg-slate-600'
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="rounded-lg bg-slate-950 px-3 py-2 text-center text-2xl font-semibold" aria-live="polite">
      {{ text || props.initial }}
      <span v-if="text !== '' && !valid()" class="block text-xs font-normal text-red-400">
        Enter 1 to {{ max }}
      </span>
    </div>
    <div class="grid grid-cols-3 gap-2">
      <button v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']" :key="d" type="button" :class="key" @click="press(d)">
        {{ d }}
      </button>
      <button type="button" :class="key" @click="text = text.slice(0, -1)" aria-label="Backspace">⌫</button>
      <button type="button" :class="key" @click="press('0')">0</button>
      <button
        type="button"
        class="min-h-12 rounded-lg bg-amber-400 text-xl font-semibold text-slate-950 disabled:opacity-40"
        :disabled="!valid()"
        @click="emit('confirm', value())"
      >
        OK
      </button>
    </div>
    <button type="button" class="min-h-11 rounded-lg text-slate-300" @click="emit('cancel')">Cancel</button>
  </div>
</template>
