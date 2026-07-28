<script setup lang="ts">
import type { SupportQuestionCategory } from '~/data/siteContent'

const props = withDefaults(defineProps<{
  categories: readonly SupportQuestionCategory[]
  ongoingCount: number
  maxOngoing?: number
}>(), {
  maxOngoing: 5,
})

const emit = defineEmits<{
  select: [categoryKey: SupportQuestionCategory['key']]
  cancel: []
}>()

const selectedCategory = ref('')
const reachedLimit = computed(() => props.ongoingCount >= props.maxOngoing)
const remainingCount = computed(() => Math.max(props.maxOngoing - props.ongoingCount, 0))

function chooseCategory() {
  if (reachedLimit.value || !selectedCategory.value) return

  const category = props.categories.find(item => item.key === selectedCategory.value)
  if (!category) return

  emit('select', category.key)
}
</script>

<template>
  <section class="question-start" aria-labelledby="new-support-question-title">
    <header class="start-header">
      <button type="button" class="back-button" aria-label="返回提問紀錄" @click="emit('cancel')">
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m12.5 4.5-5.5 5.5 5.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div>
        <h2 id="new-support-question-title">新增提問</h2>
        <p>選擇這次需要客服協助的問題類別</p>
      </div>
    </header>

    <div class="start-content">
      <div class="question-card" :class="{ limited: reachedLimit }">
        <span class="card-accent" aria-hidden="true" />

        <div class="card-heading">
          <span class="support-emblem" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none">
              <path d="M5 15v-2a9 9 0 1 1 18 0v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M5 14.5h3v7H6.5A1.5 1.5 0 0 1 5 20v-5.5ZM23 14.5h-3v7h1.5A1.5 1.5 0 0 0 23 20v-5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              <path d="M20 22c-1.2 1.3-3.2 2-6 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
          <div>
            <p class="eyebrow">CUSTOMER SUPPORT</p>
            <h3>{{ reachedLimit ? '進行中的提問已達上限' : '請選擇問題類別' }}</h3>
          </div>
        </div>

        <p v-if="reachedLimit" id="question-limit-description" class="limit-notice" role="alert">
          同時最多可有 {{ props.maxOngoing }} 筆進行中的提問。請等待客服將其中一筆結案後，再建立新提問。
        </p>
        <p v-else id="question-select-description" class="select-description">
          選擇後會直接進入對話。第一則訊息送出時，系統才會正式建立提問紀錄。
        </p>

        <label for="support-question-category">問題類別</label>
        <div class="select-shell" :class="{ disabled: reachedLimit }">
          <select
            id="support-question-category"
            v-model="selectedCategory"
            :disabled="reachedLimit"
            :aria-describedby="reachedLimit ? 'question-limit-description' : 'question-select-description'"
            @change="chooseCategory"
          >
            <option value="" disabled>請選擇問題類別</option>
            <option v-for="category in props.categories" :key="category.key" :value="category.key">
              {{ category.label }}
            </option>
          </select>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m5.5 7.5 4.5 4.5 4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <div class="category-guide" aria-label="可選問題類別">
          <div v-for="category in props.categories" :key="`guide-${category.key}`" class="category-item">
            <span class="category-icon" aria-hidden="true">{{ category.icon }}</span>
            <span>
              <strong>{{ category.label }}</strong>
              <small>{{ category.description }}</small>
            </span>
          </div>
        </div>

        <footer class="card-footer">
          <span class="ticket-capacity" :class="{ full: reachedLimit }">
            <span aria-hidden="true">{{ reachedLimit ? '●' : '◆' }}</span>
            進行中 {{ props.ongoingCount }} / {{ props.maxOngoing }}
          </span>
          <span v-if="!reachedLimit">尚可新增 {{ remainingCount }} 筆</span>
        </footer>
      </div>

      <button type="button" class="cancel-link" @click="emit('cancel')">
        返回提問紀錄
      </button>
    </div>
  </section>
</template>

<style scoped>
.question-start {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
  color: var(--color-text);
  background:
    radial-gradient(circle at 18% 0%, rgba(168, 85, 247, 0.16), transparent 34%),
    radial-gradient(circle at 90% 84%, rgba(245, 200, 66, 0.065), transparent 30%),
    var(--color-bg);
}

.start-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(168, 85, 247, 0.16);
  background: rgba(26, 10, 46, 0.88);
}

.back-button {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  color: var(--color-purple-light);
  border: 1px solid rgba(168, 85, 247, 0.22);
  border-radius: 11px;
  background: rgba(168, 85, 247, 0.08);
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.back-button:hover {
  color: var(--color-gold);
  border-color: rgba(245, 200, 66, 0.34);
  background: rgba(245, 200, 66, 0.06);
}

.back-button svg {
  width: 18px;
  height: 18px;
}

.start-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.035em;
}

.start-header p {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 11px;
}

.start-content {
  display: flex;
  width: min(620px, calc(100% - 32px));
  flex: 1;
  align-self: center;
  justify-content: center;
  flex-direction: column;
  padding: 34px 0 46px;
}

.question-card {
  position: relative;
  overflow: hidden;
  padding: 26px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025)),
    rgba(26, 10, 46, 0.78);
  box-shadow:
    0 22px 55px rgba(0, 0, 0, 0.3),
    inset 1px 1px rgba(255, 255, 255, 0.09);
}

.question-card.limited {
  border-color: rgba(251, 113, 133, 0.2);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 26px;
  width: 68px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: linear-gradient(90deg, var(--color-gold), #f59e0b);
  box-shadow: 0 0 18px rgba(245, 200, 66, 0.6);
}

.limited .card-accent {
  background: linear-gradient(90deg, #fb7185, #be123c);
  box-shadow: 0 0 18px rgba(251, 113, 133, 0.35);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 13px;
}

.support-emblem {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  color: var(--color-gold);
  border: 1px solid rgba(245, 200, 66, 0.28);
  border-radius: 15px;
  background: rgba(245, 200, 66, 0.08);
}

.support-emblem svg {
  width: 27px;
  height: 27px;
}

.eyebrow {
  margin: 0 0 2px;
  color: rgba(245, 200, 66, 0.67);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.18em;
}

.card-heading h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 17px;
  font-weight: 900;
}

.select-description,
.limit-notice {
  margin: 18px 0;
  padding: 11px 13px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.65;
}

.select-description {
  color: rgba(243, 232, 255, 0.72);
  border: 1px solid rgba(168, 85, 247, 0.18);
  background: rgba(168, 85, 247, 0.07);
}

.limit-notice {
  color: #fecdd3;
  border: 1px solid rgba(251, 113, 133, 0.25);
  background: rgba(190, 18, 60, 0.11);
}

.question-card label {
  display: block;
  margin-bottom: 7px;
  color: rgba(243, 232, 255, 0.78);
  font-size: 12px;
  font-weight: 900;
}

.select-shell {
  position: relative;
  border: 1px solid rgba(192, 132, 252, 0.36);
  border-radius: 13px;
  background: #170725;
  box-shadow:
    0 0 0 3px rgba(168, 85, 247, 0.045),
    inset 0 1px rgba(255, 255, 255, 0.035);
  transition: border-color 0.16s ease, box-shadow 0.16s ease;
}

.select-shell:focus-within {
  border-color: rgba(245, 200, 66, 0.7);
  box-shadow: 0 0 0 3px rgba(245, 200, 66, 0.1);
}

.select-shell.disabled {
  opacity: 0.52;
}

.select-shell select {
  width: 100%;
  height: 48px;
  padding: 0 46px 0 14px;
  color: var(--color-text);
  border: 0;
  outline: 0;
  appearance: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  color-scheme: dark;
}

.select-shell select:disabled {
  cursor: not-allowed;
}

.select-shell select option {
  color: #f3e8ff;
  background: #170725;
}

.select-shell > svg {
  position: absolute;
  top: 50%;
  right: 15px;
  width: 18px;
  height: 18px;
  color: var(--color-purple-light);
  pointer-events: none;
  transform: translateY(-50%);
}

.category-guide {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 18px;
}

.category-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border: 1px solid rgba(168, 85, 247, 0.11);
  border-radius: 11px;
  background: rgba(15, 0, 32, 0.34);
}

.category-icon {
  display: grid;
  width: 29px;
  height: 29px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 9px;
  background: rgba(168, 85, 247, 0.11);
  font-size: 14px;
}

.category-item > span:last-child {
  min-width: 0;
}

.category-item strong,
.category-item small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-item strong {
  color: rgba(243, 232, 255, 0.86);
  font-size: 11px;
  font-weight: 900;
}

.category-item small {
  margin-top: 1px;
  color: rgba(196, 181, 213, 0.48);
  font-size: 9px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding-top: 14px;
  color: rgba(196, 181, 213, 0.52);
  border-top: 1px solid rgba(168, 85, 247, 0.11);
  font-size: 10px;
  font-weight: 700;
}

.ticket-capacity {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(245, 200, 66, 0.75);
  font-variant-numeric: tabular-nums;
}

.ticket-capacity.full {
  color: #fda4af;
}

.cancel-link {
  align-self: center;
  margin-top: 18px;
  padding: 7px 12px;
  color: var(--color-text-muted);
  border: 0;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: color 0.16s ease;
}

.cancel-link:hover {
  color: var(--color-purple-light);
}

.back-button:focus-visible,
.cancel-link:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .start-header {
    padding: 11px 13px;
  }

  .start-header p {
    display: none;
  }

  .start-content {
    width: min(100% - 24px, 620px);
    justify-content: flex-start;
    padding: 18px 0 32px;
  }

  .question-card {
    padding: 21px 16px 18px;
    border-radius: 17px;
  }

  .card-accent {
    left: 16px;
  }

  .support-emblem {
    width: 43px;
    height: 43px;
    border-radius: 13px;
  }

  .card-heading h3 {
    font-size: 15px;
  }

  .select-description,
  .limit-notice {
    margin: 15px 0;
  }

  .category-guide {
    grid-template-columns: 1fr;
  }

  .category-item {
    padding-block: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-button,
  .cancel-link,
  .select-shell {
    transition: none;
  }
}
</style>
