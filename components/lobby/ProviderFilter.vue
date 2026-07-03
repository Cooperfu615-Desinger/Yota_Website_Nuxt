<script setup lang="ts">
const props = defineProps<{
  providers: string[]
  selectedProviders: string[]
}>()

const emit = defineEmits<{
  'update:selectedProviders': [value: string[]]
}>()

const open = ref(false)
const search = ref('')

const filteredProviders = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.providers
  return props.providers.filter((provider) => provider.toLowerCase().includes(q))
})

function toggleProvider(provider: string) {
  const exists = props.selectedProviders.includes(provider)
  emit(
    'update:selectedProviders',
    exists
      ? props.selectedProviders.filter((item) => item !== provider)
      : [...props.selectedProviders, provider]
  )
}

function clearProviders() {
  emit('update:selectedProviders', [])
}
</script>

<template>
  <div class="lobby-provider-filter">
    <button
      class="lobby-filter-select-btn"
      type="button"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>供應商：{{ selectedProviders.length ? `${selectedProviders.length} 個` : '全部' }}</span>
      <span aria-hidden="true">⌄</span>
    </button>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="provider-filter-fade">
          <div v-if="open" class="provider-filter-overlay" @click="open = false" />
        </Transition>
        <Transition name="provider-filter-panel">
          <div v-if="open" class="provider-filter-panel" role="dialog" aria-label="選擇供應商">
            <div class="provider-filter-head">
              <strong>供應商</strong>
              <button type="button" @click="open = false">關閉</button>
            </div>

            <input
              v-model="search"
              class="provider-filter-search"
              type="search"
              placeholder="搜尋供應商"
            />

            <div class="provider-filter-actions">
              <span>已選 {{ selectedProviders.length }} 個</span>
              <button type="button" @click="clearProviders">清空</button>
            </div>

            <div class="provider-filter-list">
              <label
                v-for="provider in filteredProviders"
                :key="provider"
                class="provider-filter-option"
              >
                <input
                  type="checkbox"
                  :checked="selectedProviders.includes(provider)"
                  @change="toggleProvider(provider)"
                />
                <span>{{ provider }}</span>
              </label>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>
