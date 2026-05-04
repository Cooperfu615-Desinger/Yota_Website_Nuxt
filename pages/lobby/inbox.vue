<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

// 模擬站內信列表（後續由後台 API 提供）
const messages = [
  { id: 1, title: '【系統公告】官網改版完成', preview: '巨亨ONLINE全新改版上線，帶來更順暢的遊戲體驗...', time: '2小時前', read: false, type: 'system' },
  { id: 2, title: '【活動通知】百萬大獎賽開始', preview: '百萬大獎賽已正式開始，快來衝榜贏取豐厚獎金！', time: '5小時前', read: false, type: 'event' },
  { id: 3, title: '【帳務通知】儲值到帳確認', preview: '您的儲值 NT$1,000 已成功到帳，感謝您的支持。', time: '昨天', read: true, type: 'deposit' },
  { id: 4, title: '【系統公告】例行維護公告', preview: '本系統將於今日 05:00–05:30 進行例行維護...', time: '2天前', read: true, type: 'system' },
]

type FilterKey = 'all' | 'system' | 'event' | 'deposit'
const activeFilter = ref<FilterKey>('all')
const selectedMsg  = ref<typeof messages[number] | null>(null)

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all',     label: '全部' },
  { key: 'system',  label: '系統' },
  { key: 'event',   label: '活動' },
  { key: 'deposit', label: '帳務' },
]

const filtered = computed(() =>
  activeFilter.value === 'all' ? messages : messages.filter(m => m.type === activeFilter.value)
)

const typeLabel: Record<string, string> = {
  system: '系統', event: '活動', deposit: '帳務',
}
const typeColor: Record<string, string> = {
  system: 'var(--color-text-muted)',
  event: 'var(--color-purple-light)',
  deposit: 'var(--color-gold)',
}
</script>

<template>
  <div class="lobby-page px-4 py-5">
    <h1 class="section-title mb-4">信箱</h1>

    <!-- 分類篩選 -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-1" style="scrollbar-width:none;">
      <button
        v-for="f in filters"
        :key="f.key"
        class="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all"
        :style="activeFilter === f.key
          ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff; box-shadow:0 2px 12px rgba(124,58,237,0.4);'
          : 'background:rgba(168,85,247,0.1); border:1px solid var(--color-border); color:var(--color-text-muted);'"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- 訊息列表 -->
    <div class="card-purple">
      <div
        v-for="msg in filtered"
        :key="msg.id"
        class="px-4 py-4 border-b cursor-pointer transition-all hover:bg-purple-900/10"
        style="border-color:rgba(168,85,247,0.1);"
        :class="{ 'opacity-60': msg.read }"
        @click="selectedMsg = msg; msg.read = true"
      >
        <div class="flex items-start gap-3">
          <!-- 未讀指示點 -->
          <div class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
               :style="msg.read ? 'background:transparent;' : 'background:var(--color-purple-light);'" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-sm font-bold truncate">{{ msg.title }}</span>
              <span class="text-xs flex-shrink-0" style="color:var(--color-text-muted);">{{ msg.time }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-1.5 py-0.5 rounded font-bold"
                    :style="`background:rgba(168,85,247,0.1); color:${typeColor[msg.type]};`">
                {{ typeLabel[msg.type] }}
              </span>
              <span class="text-xs truncate" style="color:var(--color-text-muted);">{{ msg.preview }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空狀態 -->
      <div v-if="filtered.length === 0" class="py-12 text-center" style="color:var(--color-text-muted);">
        <div class="text-4xl mb-3" aria-hidden="true">📭</div>
        <p class="text-sm">目前沒有訊息</p>
      </div>
    </div>

    <!-- 訊息詳情 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedMsg" class="modal-overlay" role="dialog" :aria-label="selectedMsg.title" @click.self="selectedMsg = null">
          <div class="modal-box">
            <div class="modal-handle" />
            <button class="modal-close" aria-label="關閉" @click="selectedMsg = null">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <div class="mb-1 flex items-center gap-2">
              <span class="text-xs px-1.5 py-0.5 rounded font-bold"
                    :style="`color:${typeColor[selectedMsg.type]}; background:rgba(168,85,247,0.1);`">
                {{ typeLabel[selectedMsg.type] }}
              </span>
              <span class="text-xs" style="color:var(--color-text-muted);">{{ selectedMsg.time }}</span>
            </div>
            <h2 class="modal-title">{{ selectedMsg.title }}</h2>
            <p class="text-sm leading-relaxed" style="color:var(--color-text-muted);">{{ selectedMsg.preview }}</p>
            <p class="text-sm mt-3 leading-relaxed" style="color:var(--color-text-muted);">
              完整內容將由後台系統填入。本訊息為系統示意用途。
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
