<script setup lang="ts">
import { siteContent, type GameItem, type LobbyGameCategory } from '~/data/siteContent'

defineProps<{
  category: string
  search: string
  categories: LobbyGameCategory[]
  sections: Array<{ key: string; title: string; games: GameItem[] }>
}>()

const emit = defineEmits<{
  'update:category': [value: string]
  'update:search': [value: string]
  viewCategory: [value: string]
  play: [key: string, mode: 'real' | 'demo']
}>()

const { resolvePublicAsset } = usePublicAssetPath()
const heroBanner = computed(() => siteContent.bannerSlides.find((slide) => slide.imageSrc) ?? siteContent.bannerSlides[0])
</script>

<template>
  <div class="lobby-game-home">
    <section class="lobby-game-hero" aria-label="遊戲大廳活動 Banner">
      <img
        v-if="heroBanner.imageSrc"
        :src="resolvePublicAsset(heroBanner.imageSrc)"
        :alt="heroBanner.imageAlt"
      />
      <div v-else class="lobby-game-hero-fallback" :style="{ background: heroBanner.background }">
        {{ heroBanner.imageAlt }}
      </div>
    </section>

    <SharedGameFilterBar
      :category="category"
      :search="search"
      :categories="categories"
      search-first
      @update:category="emit('update:category', $event)"
      @update:search="emit('update:search', $event)"
    />

    <LobbyGameSection
      v-for="section in sections"
      :key="section.key"
      :title="section.title"
      :games="section.games"
      @view-all="emit('viewCategory', section.key)"
      @play="(key, mode) => emit('play', key, mode)"
    />
  </div>
</template>
