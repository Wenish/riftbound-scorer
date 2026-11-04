<script setup lang="ts">
import { onMounted } from 'vue'
import UpdatePrompt from './components/UpdatePrompt.vue'
import { useMatchesStore } from './stores/matches'
import { useNavStore } from './stores/nav'
import { useSettingsStore } from './stores/settings'
import HomeView from './views/HomeView.vue'
import MatchDetailView from './views/MatchDetailView.vue'
import MatchView from './views/MatchView.vue'
import NewMatchView from './views/NewMatchView.vue'
import OnboardingView from './views/OnboardingView.vue'

const nav = useNavStore()
const settings = useSettingsStore()
const matches = useMatchesStore()

onMounted(async () => {
  await Promise.all([settings.load(), matches.load()])
  // Unfinished matches are resumed from the Home screen, not forced open.
  matches.closeActive()
  nav.navigate(settings.nickname ? 'home' : 'onboarding')
})
</script>

<template>
  <main class="min-h-dvh bg-slate-950 text-slate-100">
    <p v-if="nav.view === 'loading'" class="p-4 text-center text-slate-400">Loading…</p>
    <OnboardingView v-else-if="nav.view === 'onboarding'" />
    <HomeView v-else-if="nav.view === 'home'" />
    <NewMatchView v-else-if="nav.view === 'new-match'" />
    <MatchView v-else-if="nav.view === 'match'" />
    <MatchDetailView v-else-if="nav.view === 'detail'" />
  </main>
  <!-- Never offer (or trigger) a reload mid-match; the prompt returns afterwards. -->
  <UpdatePrompt v-if="nav.view !== 'match'" />
</template>
