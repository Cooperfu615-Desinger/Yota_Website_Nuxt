<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

const route = useRoute()
const { activeSection } = useMemberProfileState()
const validSections = new Set(['profile', 'bindings', 'vip', 'rewards', 'history'])

function syncSectionFromRoute() {
  const tab = typeof route.query.tab === 'string' ? route.query.tab : 'profile'
  activeSection.value = (validSections.has(tab) ? tab : 'profile') as typeof activeSection.value
}

onMounted(syncSectionFromRoute)
watch(() => route.query.tab, syncSectionFromRoute)
</script>

<template>
  <div class="lobby-page px-4 py-5">
    <MemberProfileView />
  </div>
</template>
