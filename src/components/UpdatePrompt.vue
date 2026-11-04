<script setup lang="ts">
import { watch } from 'vue'
import { usePwaUpdate } from '../platform/pwa'

const { needRefresh, offlineReady, applyUpdate, dismiss } = usePwaUpdate()

// The "ready to work offline" notice is informational only; hide it after a few seconds.
watch(offlineReady, (ready) => {
  // Re-check on timeout so an update prompt that appeared meanwhile isn't dismissed with it.
  if (ready && !needRefresh.value) setTimeout(() => !needRefresh.value && dismiss(), 4000)
})
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
    role="status"
    aria-live="polite"
  >
    <div
      v-if="needRefresh"
      class="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-600 bg-slate-800 py-2 pr-2 pl-4 text-slate-50 shadow-lg"
    >
      <p class="flex-1 text-sm font-medium">Update available</p>
      <button
        type="button"
        class="min-h-11 rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-50"
        @click="dismiss"
      >
        Later
      </button>
      <button
        type="button"
        class="min-h-11 rounded-lg bg-sky-400 px-4 text-sm font-semibold text-slate-950 hover:bg-sky-300"
        @click="applyUpdate"
      >
        Reload
      </button>
    </div>
    <div
      v-else-if="offlineReady"
      class="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-600 bg-slate-800 py-2 pr-2 pl-4 text-slate-50 shadow-lg"
    >
      <p class="flex-1 text-sm font-medium">Ready to work offline</p>
      <button
        type="button"
        class="min-h-11 rounded-lg px-3 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-50"
        @click="dismiss"
      >
        OK
      </button>
    </div>
  </div>
</template>
