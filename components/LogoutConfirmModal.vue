<script setup lang="ts">
const router = useRouter()
const { logout } = useAppState()
const { showLogoutConfirm, closeLogoutConfirm } = useLogoutState()

async function confirmLogout() {
  logout()
  closeLogoutConfirm()
  await router.push('/')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="logout-fade">
      <div
        v-if="showLogoutConfirm"
        class="logout-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        @click.self="closeLogoutConfirm"
      >
        <div class="logout-panel">
          <span aria-hidden="true">⇥</span>
          <h2 id="logout-title">確定要登出？</h2>
          <p>登入與個人資料會從此瀏覽器移除，金融及社交 Mock 也會重置。</p>
          <div>
            <button class="btn-outline-purple" @click="closeLogoutConfirm">取消</button>
            <button class="logout-confirm" @click="confirmLogout">確認登出</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.logout-fade-enter-active,.logout-fade-leave-active{transition:opacity .2s}.logout-fade-enter-from,.logout-fade-leave-to{opacity:0}.logout-overlay{position:fixed;inset:0;z-index:1090;display:grid;place-items:center;padding:18px;background:rgba(5,0,15,.86);backdrop-filter:blur(10px)}.logout-panel{width:min(390px,100%);padding:26px;border:1px solid rgba(248,113,113,.25);border-radius:20px;background:linear-gradient(155deg,#21103a,#10051f);text-align:center}.logout-panel>span{font-size:35px}.logout-panel h2{margin:8px 0;font-size:21px}.logout-panel p{color:var(--color-text-muted);font-size:10px;line-height:1.7}.logout-panel>div{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:17px}.logout-panel>div>*{justify-content:center}.logout-confirm{border-radius:10px;color:#fff;background:#be123c;font-size:10px;font-weight:900}
</style>
