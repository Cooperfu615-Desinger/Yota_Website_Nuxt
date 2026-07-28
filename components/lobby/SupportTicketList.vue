<script setup lang="ts">
import type { SupportTicket } from '~/data/siteContent'

type TicketFilter = 'all' | SupportTicket['status']

const props = withDefaults(defineProps<{
  tickets: SupportTicket[]
  activeFilter?: TicketFilter
}>(), {
  activeFilter: 'all',
})

const emit = defineEmits<{
  open: [ticketId: SupportTicket['id']]
  new: []
  'update:activeFilter': [filter: TicketFilter]
}>()

const selectedFilter = ref<TicketFilter>(props.activeFilter)

watch(() => props.activeFilter, (filter) => {
  selectedFilter.value = filter
})

const filterOptions: { key: TicketFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'ongoing', label: '進行中' },
  { key: 'closed', label: '已結案' },
]

const filteredTickets = computed(() => {
  if (selectedFilter.value === 'all') return props.tickets
  return props.tickets.filter(ticket => ticket.status === selectedFilter.value)
})

function filterCount(filter: TicketFilter) {
  if (filter === 'all') return props.tickets.length
  return props.tickets.filter(ticket => ticket.status === filter).length
}

function selectFilter(filter: TicketFilter) {
  selectedFilter.value = filter
  emit('update:activeFilter', filter)
}

function lastMessage(ticket: SupportTicket) {
  return ticket.messages.at(-1)
}

function latestText(ticket: SupportTicket) {
  return lastMessage(ticket)?.text || '尚未留下訊息'
}

function latestTime(ticket: SupportTicket) {
  return lastMessage(ticket)?.time || ticket.updatedAt
}

function unreadLabel(unread: number) {
  return unread > 99 ? '99+' : String(unread)
}

const emptyCopy = computed(() => {
  if (selectedFilter.value === 'ongoing') {
    return {
      title: '目前沒有進行中的提問',
      description: '若需要客服協助，可以建立一筆新的提問。',
    }
  }
  if (selectedFilter.value === 'closed') {
    return {
      title: '目前沒有已結案的提問',
      description: '客服完成處理後，紀錄會保留在這裡。',
    }
  }
  return {
    title: '尚無提問紀錄',
    description: '選擇問題類別後，即可開始與客服對話。',
  }
})
</script>

<template>
  <section class="support-ticket-list" aria-labelledby="support-ticket-list-title">
    <header class="ticket-list-header">
      <div class="ticket-list-heading">
        <span class="heading-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 5.75h14v10.5H9l-4 3v-13.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M8.5 9.25h7M8.5 12.5H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
        <div>
          <h2 id="support-ticket-list-title">提問紀錄</h2>
          <p>{{ props.tickets.length }} 筆客服對話</p>
        </div>
      </div>

      <button class="new-ticket-button" type="button" @click="emit('new')">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        新增提問
      </button>
    </header>

    <div class="ticket-filter" role="group" aria-label="篩選提問狀態">
      <button
        v-for="option in filterOptions"
        :key="option.key"
        type="button"
        :class="{ active: selectedFilter === option.key }"
        :aria-pressed="selectedFilter === option.key"
        @click="selectFilter(option.key)"
      >
        <span>{{ option.label }}</span>
        <span class="filter-count">{{ filterCount(option.key) }}</span>
      </button>
    </div>

    <div
      v-if="filteredTickets.length === 0"
      class="ticket-empty"
      role="status"
      aria-live="polite"
    >
      <span class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M7 7.5h18v14H13l-6 4v-18Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
          <path d="M11 12h10M11 16h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </span>
      <h3>{{ emptyCopy.title }}</h3>
      <p>{{ emptyCopy.description }}</p>
      <button type="button" @click="emit('new')">新增提問</button>
    </div>

    <ul v-else class="ticket-items" aria-label="客服提問清單">
      <li v-for="ticket in filteredTickets" :key="ticket.id">
        <button
          class="ticket-row"
          type="button"
          :aria-label="`開啟 ${ticket.subject}，${ticket.categoryLabel}，${ticket.status === 'ongoing' ? '進行中' : '已結案'}${ticket.unread > 0 ? `，${ticket.unread} 則未讀訊息` : ''}`"
          @click="emit('open', ticket.id)"
        >
          <span class="ticket-rail" :class="ticket.status" aria-hidden="true" />

          <span class="ticket-main">
            <span class="ticket-title-line">
              <span class="ticket-title">{{ ticket.subject }}</span>
              <span class="ticket-status" :class="ticket.status">
                <span class="status-dot" aria-hidden="true" />
                {{ ticket.status === 'ongoing' ? '進行中' : '已結案' }}
              </span>
            </span>
            <span class="ticket-preview">{{ latestText(ticket) }}</span>
            <span class="ticket-meta">
              <span class="ticket-category">{{ ticket.categoryLabel }}</span>
              <span aria-hidden="true">・</span>
              <span class="ticket-id">案件 #{{ ticket.id }}</span>
              <span aria-hidden="true">・</span>
              <span>{{ latestTime(ticket) }}</span>
            </span>
          </span>

          <span class="ticket-side">
            <span
              v-if="ticket.unread > 0"
              class="unread-count"
              :aria-label="`${ticket.unread} 則未讀訊息`"
            >
              {{ unreadLabel(ticket.unread) }}
            </span>
            <svg class="row-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="m7.5 4.5 5.5 5.5-5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.support-ticket-list {
  --ticket-line: rgba(168, 85, 247, 0.16);
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  color: var(--color-text);
  background:
    radial-gradient(circle at 88% -20%, rgba(168, 85, 247, 0.15), transparent 35%),
    var(--color-bg);
}

.ticket-list-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px 15px;
  border-bottom: 1px solid var(--ticket-line);
  background: rgba(26, 10, 46, 0.88);
}

.ticket-list-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 11px;
}

.heading-mark {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  color: var(--color-gold);
  border: 1px solid rgba(245, 200, 66, 0.32);
  border-radius: 12px;
  background: linear-gradient(145deg, rgba(245, 200, 66, 0.16), rgba(245, 200, 66, 0.04));
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.08);
}

.heading-mark svg {
  width: 20px;
  height: 20px;
}

.ticket-list-heading h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.ticket-list-heading p {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
}

.new-ticket-button {
  display: inline-flex;
  min-height: 38px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  color: #1a0a00;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #f7d55f, #d98912);
  box-shadow: 0 5px 18px rgba(245, 200, 66, 0.22);
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
}

.new-ticket-button svg {
  width: 16px;
  height: 16px;
}

.new-ticket-button:hover {
  filter: brightness(1.07);
  box-shadow: 0 7px 22px rgba(245, 200, 66, 0.32);
  transform: translateY(-1px);
}

.new-ticket-button:active {
  transform: translateY(0) scale(0.98);
}

.ticket-filter {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--ticket-line);
  background: rgba(15, 0, 32, 0.72);
}

.ticket-filter button {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  gap: 7px;
  padding: 7px 12px;
  color: var(--color-text-muted);
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.ticket-filter button:hover {
  color: var(--color-text);
  background: rgba(168, 85, 247, 0.09);
}

.ticket-filter button.active {
  color: var(--color-purple-light);
  border-color: rgba(168, 85, 247, 0.28);
  background: rgba(168, 85, 247, 0.15);
}

.filter-count {
  min-width: 18px;
  padding: 1px 5px;
  color: inherit;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  text-align: center;
  font-size: 10px;
  line-height: 16px;
}

.ticket-items {
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  scrollbar-color: rgba(168, 85, 247, 0.45) transparent;
}

.ticket-items li {
  border-bottom: 1px solid rgba(168, 85, 247, 0.1);
}

.ticket-row {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 98px;
  align-items: center;
  gap: 13px;
  padding: 15px 20px 15px 24px;
  color: inherit;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.16s ease;
}

.ticket-row:hover {
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.11), rgba(168, 85, 247, 0.035));
}

.ticket-row:focus-visible,
.ticket-filter button:focus-visible,
.new-ticket-button:focus-visible,
.ticket-empty button:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: -3px;
}

.ticket-rail {
  position: absolute;
  top: 16px;
  bottom: 16px;
  left: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
}

.ticket-rail.ongoing {
  background: var(--color-gold);
  box-shadow: 0 0 12px rgba(245, 200, 66, 0.4);
}

.ticket-rail.closed {
  background: rgba(196, 181, 213, 0.38);
}

.ticket-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.ticket-title-line {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.ticket-title {
  overflow: hidden;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.025em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticket-status {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
}

.ticket-status.ongoing {
  color: #fde68a;
  border: 1px solid rgba(245, 200, 66, 0.26);
  background: rgba(245, 200, 66, 0.09);
}

.ticket-status.closed {
  color: rgba(216, 201, 230, 0.7);
  border: 1px solid rgba(196, 181, 213, 0.16);
  background: rgba(196, 181, 213, 0.06);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 7px currentColor;
}

.ticket-preview {
  margin-top: 7px;
  overflow: hidden;
  color: rgba(243, 232, 255, 0.67);
  font-size: 12px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticket-meta {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 5px;
  color: rgba(196, 181, 213, 0.46);
  font-size: 10px;
}

.ticket-id {
  color: rgba(245, 200, 66, 0.63);
  font-variant-numeric: tabular-nums;
}

.ticket-category {
  color: rgba(192, 132, 252, 0.72);
}

.ticket-side {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
}

.unread-count {
  min-width: 23px;
  height: 23px;
  padding: 0 6px;
  color: #fff;
  border: 1px solid rgba(216, 180, 254, 0.42);
  border-radius: 999px;
  background: linear-gradient(135deg, #a855f7, #7e22ce);
  box-shadow: 0 3px 10px rgba(126, 34, 206, 0.3);
  text-align: center;
  font-size: 10px;
  font-weight: 900;
  line-height: 21px;
  font-variant-numeric: tabular-nums;
}

.row-arrow {
  width: 18px;
  height: 18px;
  color: rgba(196, 181, 213, 0.36);
  transition: color 0.16s ease, transform 0.16s ease;
}

.ticket-row:hover .row-arrow {
  color: var(--color-gold);
  transform: translateX(2px);
}

.ticket-empty {
  display: flex;
  flex: 1;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 38px 24px;
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  color: rgba(192, 132, 252, 0.72);
  border: 1px solid rgba(168, 85, 247, 0.22);
  border-radius: 21px;
  background: rgba(168, 85, 247, 0.08);
}

.empty-icon svg {
  width: 31px;
  height: 31px;
}

.ticket-empty h3 {
  margin: 16px 0 0;
  color: var(--color-text);
  font-size: 15px;
  font-weight: 900;
}

.ticket-empty p {
  max-width: 310px;
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.65;
}

.ticket-empty button {
  margin-top: 16px;
  padding: 8px 16px;
  color: var(--color-gold);
  border: 1px solid rgba(245, 200, 66, 0.3);
  border-radius: 999px;
  background: rgba(245, 200, 66, 0.07);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

@media (max-width: 560px) {
  .ticket-list-header {
    padding: 14px 13px 12px;
  }

  .heading-mark {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .ticket-list-heading h2 {
    font-size: 15px;
  }

  .ticket-list-heading p {
    display: none;
  }

  .new-ticket-button {
    min-height: 35px;
    padding: 7px 12px;
    font-size: 12px;
  }

  .ticket-filter {
    padding: 8px 12px;
  }

  .ticket-filter button {
    flex: 1;
    justify-content: center;
    padding-inline: 7px;
  }

  .ticket-row {
    min-height: 94px;
    gap: 8px;
    padding: 13px 12px 13px 17px;
  }

  .ticket-title-line {
    gap: 6px;
  }

  .ticket-title {
    font-size: 13px;
  }

  .ticket-preview {
    max-width: calc(100vw - 102px);
  }

  .ticket-side {
    gap: 5px;
  }

  .row-arrow {
    width: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .new-ticket-button,
  .ticket-row,
  .row-arrow {
    transition: none;
  }
}
</style>
