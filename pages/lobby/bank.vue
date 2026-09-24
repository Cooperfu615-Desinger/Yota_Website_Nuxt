<script setup lang="ts">
definePageMeta({
  layout: 'lobby',
  middleware: (to) => {
    const tab = to.query.tab
    if (tab === 'offers') return navigateTo('/lobby/offers', { replace: true })
    if (tab === 'overview' || tab === 'wallet' || tab === 'vault' || tab === 'transfer' || tab === 'gifts' || tab === 'exchange' || tab === 'records') {
      const normalizedTab = tab === 'wallet' ? 'overview' : tab === 'transfer' ? 'gifts' : tab
      const query = normalizedTab === 'gifts' && typeof to.query.receiverId === 'string'
        ? { tab: normalizedTab, receiverId: to.query.receiverId }
        : { tab: normalizedTab }
      return navigateTo({ path: '/lobby/vault', query }, { replace: true })
    }
  },
})
</script>

<template>
  <LobbyBankContent />
</template>
