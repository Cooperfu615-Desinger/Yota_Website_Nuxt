<script setup lang="ts">
const {
  showAgeGateModal,
  ageGateSkipNext,
  closeAgeGate,
  confirmAgeGate,
} = useAgeGateState()
</script>

<template>
  <Teleport to="body">
    <Transition name="age-gate-fade">
      <div
        v-if="showAgeGateModal"
        class="age-gate-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        @click.self="closeAgeGate"
      >
        <div class="age-gate-card">
          <div class="age-gate-titlebar">
            <span id="age-gate-title">提示</span>
          </div>

          <div class="age-gate-body">
            <p class="age-gate-message">
              本網站於遊戲軟體分級為限制級，進入遊玩
              <strong>「巨亨ONLINE WEB館」</strong>
              前，請確認您年齡已滿 18 歲。
            </p>

            <label class="age-gate-check">
              <input v-model="ageGateSkipNext" type="checkbox">
              <span class="age-gate-box" aria-hidden="true">
                <svg v-if="ageGateSkipNext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m5 12 4 4L19 6"/>
                </svg>
              </span>
              <span>下次不再提示</span>
            </label>

            <button class="age-gate-confirm" type="button" @click="confirmAgeGate">
              確定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.age-gate-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.66);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.age-gate-card {
  width: min(500px, 100%);
  overflow: hidden;
  background: linear-gradient(180deg, rgba(83, 42, 48, 0.98), rgba(52, 24, 38, 0.98));
  border: 1px solid rgba(245, 200, 66, 0.38);
  border-radius: 12px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.58),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.age-gate-titlebar {
  min-height: 68px;
  display: grid;
  place-items: center;
  color: #271400;
  background: linear-gradient(100deg, #f4a51f 0%, #fee7aa 100%);
  font-size: 18px;
  font-weight: 950;
  letter-spacing: 0.08em;
}
.age-gate-body {
  padding: 28px 26px 22px;
}
.age-gate-message {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.85;
}
.age-gate-message strong {
  color: #ffe7ad;
  font-weight: 950;
}
.age-gate-check {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 26px;
  color: #fff;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
  user-select: none;
}
.age-gate-check input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.age-gate-box {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  color: #2b1500;
  background: rgba(255, 255, 255, 0.08);
  border: 3px solid rgba(255, 255, 255, 0.92);
  border-radius: 4px;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.age-gate-check input:checked + .age-gate-box {
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  border-color: var(--color-gold-light);
}
.age-gate-box svg {
  width: 18px;
  height: 18px;
}
.age-gate-confirm {
  width: 100%;
  min-height: 52px;
  margin-top: 26px;
  color: #2b1500;
  background: linear-gradient(135deg, #f6af2b 0%, #f6c24a 100%);
  border: 0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 17px;
  font-weight: 950;
  letter-spacing: 0.05em;
  box-shadow: 0 12px 26px rgba(245, 166, 35, 0.22);
  transition: transform 0.18s ease, filter 0.18s ease;
}
.age-gate-confirm:hover {
  transform: translateY(-1px);
  filter: brightness(1.04);
}
.age-gate-confirm:active {
  transform: translateY(0);
}
.age-gate-fade-enter-active,
.age-gate-fade-leave-active {
  transition: opacity 0.2s ease;
}
.age-gate-fade-enter-active .age-gate-card,
.age-gate-fade-leave-active .age-gate-card {
  transition: transform 0.2s ease;
}
.age-gate-fade-enter-from,
.age-gate-fade-leave-to {
  opacity: 0;
}
.age-gate-fade-enter-from .age-gate-card,
.age-gate-fade-leave-to .age-gate-card {
  transform: translateY(12px) scale(0.96);
}
</style>
