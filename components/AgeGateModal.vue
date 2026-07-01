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
          <button class="age-gate-close" type="button" aria-label="關閉提示" @click="closeAgeGate">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="age-gate-body">
            <div class="age-gate-mark" aria-hidden="true">
              <span>18+</span>
            </div>

            <h2 id="age-gate-title" class="age-gate-title">限制級提示</h2>

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
  background:
    radial-gradient(circle at 50% 26%, rgba(168, 85, 247, 0.2), transparent 34%),
    rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.age-gate-card {
  position: relative;
  width: min(430px, 100%);
  overflow: hidden;
  padding: 15px;
  background: linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%);
  border: 1px solid rgba(255,255,255,0.28);
  border-radius: 24px;
  box-shadow:
    0 8px 40px rgba(0,0,0,0.55),
    0 0 48px rgba(168,85,247,0.18),
    inset 0 1px 0 rgba(255,255,255,0.22);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.age-gate-body {
  position: relative;
  overflow: hidden;
  padding: 28px 22px 24px;
  background:
    radial-gradient(circle at 18% 0%, rgba(245, 200, 66, 0.16), transparent 32%),
    radial-gradient(circle at 92% 10%, rgba(192, 132, 252, 0.24), transparent 38%),
    linear-gradient(180deg, #8890FF 0%, #5A63E8 48%, #3F46AA 100%);
  border-radius: 14px;
  box-shadow:
    0 0 0 1.5px rgba(255,255,255,0.25),
    0 0 0 3px rgba(122,131,255,0.75),
    0 4px 20px rgba(63,70,170,0.4);
}
.age-gate-close {
  position: absolute;
  top: 26px;
  right: 26px;
  z-index: 2;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.82);
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  transition: all 0.2s;
}
.age-gate-close:hover {
  color: #fff;
  background: rgba(255,255,255,0.25);
}
.age-gate-mark {
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  margin: 0 auto 14px;
  color: #2b1500;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-light));
  border: 3px solid rgba(255,255,255,0.85);
  border-radius: 20px;
  box-shadow: 0 10px 26px rgba(0,0,0,0.24), 0 0 20px rgba(245,200,66,0.35);
}
.age-gate-mark span {
  font-size: 21px;
  font-weight: 950;
  letter-spacing: -0.02em;
}
.age-gate-title {
  margin: 0 0 18px;
  color: #fff;
  font-size: 22px;
  font-weight: 950;
  letter-spacing: 0.06em;
  text-align: center;
  text-shadow: 0 1px 8px rgba(0,0,0,0.3);
}
.age-gate-title::after {
  content: '';
  display: block;
  width: 44px;
  height: 2px;
  margin: 9px auto 0;
  background: rgba(255,255,255,0.45);
  border-radius: 999px;
}
.age-gate-message {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.85;
  text-align: center;
  text-shadow: 0 1px 4px rgba(0,0,0,0.18);
}
.age-gate-message strong {
  color: var(--color-gold-light);
  font-weight: 950;
}
.age-gate-check {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
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
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  border: 1.5px solid rgba(255, 255, 255, 0.34);
  border-radius: 8px;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.age-gate-check input:checked + .age-gate-box {
  background: linear-gradient(180deg, #A3FFD1 0%, #1AB16D 100%);
  border-color: rgba(255, 255, 255, 0.9);
}
.age-gate-box svg {
  width: 18px;
  height: 18px;
}
.age-gate-confirm {
  width: 100%;
  min-height: 52px;
  margin-top: 26px;
  color: #fff;
  background: linear-gradient(180deg, #A3FFD1 0%, #1AB16D 100%);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  font-family: inherit;
  font-size: 17px;
  font-weight: 950;
  letter-spacing: 0.05em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: transform 0.18s ease, filter 0.18s ease;
}
.age-gate-confirm:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
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
