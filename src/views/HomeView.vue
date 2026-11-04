<script setup lang="ts">
// Contract: match history + entry points.
// Reads: useMatchesStore (history, unfinished), useSettingsStore (nickname).
// Navigates: nav.navigate('new-match'); for the "Resume" row: matches.resume(id) then
// nav.navigate('match'); for a history row: nav.navigate('detail', { matchId }).
// No props / emits.
import { computed, ref } from 'vue'
import { deriveState, type Match } from '../game'
import { shouldHintInstall } from '../platform/pwa'
import { useMatchesStore } from '../stores/matches'
import { useNavStore } from '../stores/nav'
import { useSettingsStore } from '../stores/settings'

const matches = useMatchesStore()
const nav = useNavStore()
const settings = useSettingsStore()

const showInstallHint = shouldHintInstall()
const editingName = ref(false)
const nameDraft = ref('')
const deleting = ref<Match | null>(null)
const confirmingNew = ref(false)

function startNew() {
  if (unfinished.value) confirmingNew.value = true
  else nav.navigate('new-match')
}

async function discardAndStartNew() {
  if (unfinished.value) await matches.remove(unfinished.value.id)
  confirmingNew.value = false
  nav.navigate('new-match')
}

function resumeFromConfirm() {
  confirmingNew.value = false
  if (unfinished.value) resume(unfinished.value)
}

const unfinished = computed(() => matches.unfinished)
const finished = computed(() =>
  matches.history.filter((m) => m.endedAt !== undefined).sort((a, b) => b.createdAt - a.createdAt),
)

function scores(m: Match): [number, number] {
  return deriveState(m, m.endedAt ?? m.createdAt).scores
}

function resigned(m: Match): boolean {
  return m.actions.some((a) => a.kind === 'resign')
}

function resume(m: Match) {
  matches.resume(m.id)
  nav.navigate('match')
}

function startEditName() {
  nameDraft.value = settings.nickname
  editingName.value = true
}

async function saveName() {
  await settings.setNickname(nameDraft.value)
  editingName.value = false
}

async function confirmDelete() {
  if (deleting.value) await matches.remove(deleting.value.id)
  deleting.value = null
}
</script>

<template>
  <section class="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Match History</h1>
      <button
        type="button"
        aria-label="Start new match"
        class="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-3xl font-bold text-slate-950"
        @click="startNew"
      >
        +
      </button>
    </header>

    <div
      v-if="unfinished"
      class="flex items-center justify-between gap-3 rounded-lg border-2 border-amber-400 bg-slate-900 p-3"
    >
      <div class="min-w-0">
        <p class="text-xs font-bold uppercase text-amber-400">Unfinished</p>
        <p class="truncate text-lg">
          {{ unfinished.players[0].name }} ({{ scores(unfinished)[0] }}) vs ({{ scores(unfinished)[1] }})
          {{ unfinished.players[1].name }}
        </p>
      </div>
      <button
        type="button"
        class="min-h-11 shrink-0 rounded-lg bg-amber-400 px-4 font-bold text-slate-950"
        @click="resume(unfinished)"
      >
        Resume
      </button>
    </div>

    <p v-if="!unfinished && finished.length === 0" class="py-8 text-center text-slate-300">
      No matches yet. Tap + to start one.
    </p>

    <ul class="flex flex-col gap-2">
      <li
        v-for="m in finished"
        :key="m.id"
        class="flex items-stretch overflow-hidden rounded-lg border border-slate-600 bg-slate-900"
      >
        <button
          type="button"
          class="min-h-12 min-w-0 flex-1 truncate px-3 py-2 text-left text-lg"
          @click="nav.navigate('detail', { matchId: m.id })"
        >
          {{ m.players[0].name }} ({{ scores(m)[0] }}) vs ({{ scores(m)[1] }}) {{ m.players[1].name }}<span v-if="resigned(m)" class="text-sm text-amber-400"> · resigned</span>
        </button>
        <button
          type="button"
          aria-label="Delete match"
          class="min-h-11 min-w-12 text-xl text-red-400"
          @click="deleting = m"
        >
          🗑
        </button>
      </li>
    </ul>

    <footer class="mt-auto flex flex-col gap-3 pt-4">
      <p v-if="showInstallHint" class="text-sm text-slate-300">
        Tip: install this app (Add to Home Screen) so your matches are kept safely on this device.
      </p>
      <div v-if="editingName" class="flex gap-2">
        <input
          v-model="nameDraft"
          maxlength="30"
          aria-label="Your Nickname"
          class="min-h-11 min-w-0 flex-1 rounded-lg border-2 border-slate-500 bg-slate-900 px-3 text-white focus:border-white focus:outline-none"
          @keyup.enter="saveName"
        />
        <button type="button" class="min-h-11 rounded-lg bg-emerald-500 px-4 font-bold text-slate-950" @click="saveName">
          Save
        </button>
        <button type="button" class="min-h-11 rounded-lg border border-slate-500 px-3" @click="editingName = false">
          Cancel
        </button>
      </div>
      <button
        v-else
        type="button"
        class="min-h-11 rounded-lg border border-slate-500 px-4 text-slate-100"
        @click="startEditName"
      >
        Nickname: {{ settings.nickname }} (change)
      </button>
    </footer>

    <div v-if="confirmingNew" class="fixed inset-0 z-10 flex items-center justify-center bg-black/80 p-6" role="dialog">
      <div class="w-full max-w-sm rounded-lg border border-slate-500 bg-slate-900 p-4">
        <p class="mb-4 text-lg">Discard the unfinished match and start a new one?</p>
        <div class="flex gap-2">
          <button type="button" class="min-h-11 flex-1 rounded-lg border border-slate-500" @click="resumeFromConfirm">
            Resume
          </button>
          <button
            type="button"
            class="min-h-11 flex-1 rounded-lg bg-red-500 font-bold text-white"
            @click="discardAndStartNew"
          >
            Discard &amp; start new
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleting" class="fixed inset-0 z-10 flex items-center justify-center bg-black/80 p-6" role="dialog">
      <div class="w-full max-w-sm rounded-lg border border-slate-500 bg-slate-900 p-4">
        <p class="mb-4 text-lg">
          Delete {{ deleting.players[0].name }} vs {{ deleting.players[1].name }}? This cannot be undone.
        </p>
        <div class="flex gap-2">
          <button type="button" class="min-h-11 flex-1 rounded-lg border border-slate-500" @click="deleting = null">
            Cancel
          </button>
          <button type="button" class="min-h-11 flex-1 rounded-lg bg-red-500 font-bold text-white" @click="confirmDelete">
            Delete
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
