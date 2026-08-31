<script setup lang="ts">
const { isLoggedIn } = useAppState()
const { isOpen, closeProfile } = useMemberProfileState()
</script>

<template>
  <Teleport to="body">
    <Transition name="member-profile-modal-fade">
      <div
        v-if="isOpen && isLoggedIn"
        class="modal-overlay member-profile-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-profile-modal-title"
        tabindex="-1"
        @keydown.esc="closeProfile"
      >
        <div class="member-profile-modal" @click.stop>
          <MemberProfileView embedded @close="closeProfile" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.member-profile-modal-overlay {
  align-items: flex-start;
  overflow-y: auto;
  padding: 18px;
}

.member-profile-modal {
  width: min(1120px, calc(100vw - 36px));
  max-height: calc(100dvh - 36px);
  overflow-y: auto;
  margin: auto;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06));
  box-shadow: 0 14px 52px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.member-profile-modal-fade-enter-active,
.member-profile-modal-fade-leave-active { transition: opacity 0.2s ease; }
.member-profile-modal-fade-enter-from,
.member-profile-modal-fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .member-profile-modal-overlay { padding: 10px; }
  .member-profile-modal { width: calc(100vw - 20px); max-height: calc(100dvh - 20px); padding: 12px; border-radius: 18px; }
}
</style>
