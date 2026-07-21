<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'
import { getGameMachines, type GameMachine, type MachineStatus } from '~/data/gameMachines'

const props = defineProps<{ gameKey: string; mode: 'real' | 'demo' }>()
const emit = defineEmits<{ close: []; back: []; enter: [machineId: string] }>()
const allGames: GameItem[] = [...siteContent.games, ...siteContent.lobbyGames] as GameItem[]
const game = computed(() => allGames.find(item => item.key === props.gameKey))
const machines = computed(() => getGameMachines(props.gameKey))
const statusFilter = ref<'all' | MachineStatus>('all')
const page = ref(1)
const pageSize = 28
const selectedId = ref<string | null>(null)
const reservedIds = ref<string[]>([])
const notice = ref('')

const filteredMachines = computed(() => statusFilter.value === 'all' ? machines.value : machines.value.filter(item => item.status === statusFilter.value))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredMachines.value.length / pageSize)))
const pageMachines = computed(() => filteredMachines.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const selectedMachine = computed(() => machines.value.find(item => item.id === selectedId.value) ?? null)
const statusLabels = { available: '空閒', occupied: '使用中', maintenance: '維護' }

watch(statusFilter, () => { page.value = 1; selectedId.value = null })
function selectMachine(machine: GameMachine) { if (machine.status === 'available') selectedId.value = machine.id }
function reserve(machine: GameMachine) { if (!reservedIds.value.includes(machine.id)) reservedIds.value = [...reservedIds.value, machine.id]; notice.value = `${machine.number} 號機台已加入預約提醒` }
function enterSelected() { if (selectedId.value) emit('enter', selectedId.value) }
</script>

<template>
  <Teleport to="body">
    <Transition name="seat-fade" appear><div class="seat-overlay" role="dialog" aria-modal="true" aria-label="選擇機台" @click.self="emit('close')"><article class="seat-panel">
      <header class="seat-header"><button class="seat-back" @click="emit('back')">← 返回</button><div><p>LIVE MACHINE MAP</p><h2>{{ game?.name }}・選擇機台</h2></div><button class="seat-close" aria-label="關閉" @click="emit('close')">×</button></header>
      <div class="seat-toolbar"><div class="seat-status-tabs"><button v-for="filter in ([['all','全部'],['available','空閒'],['occupied','使用中'],['maintenance','維護']] as const)" :key="filter[0]" :class="{ active: statusFilter === filter[0] }" @click="statusFilter = filter[0]">{{ filter[1] }}</button></div><span>{{ mode === 'real' ? '真錢模式' : '試玩模式' }}・共 {{ filteredMachines.length }} 台</span></div>
      <p v-if="notice" class="seat-notice">{{ notice }}</p>
      <div class="seat-body">
        <div class="machine-grid">
          <div v-for="machine in pageMachines" :key="machine.id" class="machine-seat" :class="[`status-${machine.status}`, { selected: selectedId === machine.id, reserved: reservedIds.includes(machine.id) }]" :role="machine.status === 'available' ? 'button' : undefined" :tabindex="machine.status === 'available' ? 0 : -1" @click="selectMachine(machine)" @keydown.enter="selectMachine(machine)">
            <span>{{ String(machine.number).padStart(2,'0') }}</span><strong>{{ statusLabels[machine.status] }}</strong><small v-if="machine.status === 'occupied'">{{ machine.player }}</small><small v-else>RTP {{ machine.rtp }}</small>
            <button v-if="machine.status === 'occupied'" type="button" class="reserve-mini" @click.stop="reserve(machine)">{{ reservedIds.includes(machine.id) ? '已預約' : '預約' }}</button>
          </div>
        </div>
        <aside class="machine-detail">
          <template v-if="selectedMachine"><p>SELECTED MACHINE</p><h3>{{ String(selectedMachine.number).padStart(2,'0') }} 號機台</h3><div class="machine-metrics"><div><span>Free Game</span><strong>{{ selectedMachine.freeGame }}</strong></div><div><span>RTP</span><strong>{{ selectedMachine.rtp }}</strong></div><div><span>命中率</span><strong>{{ selectedMachine.hitRate }}</strong></div></div><h4>總投注統計</h4><dl><div><dt>今日</dt><dd>{{ selectedMachine.totalBet.today.toLocaleString() }}</dd></div><div><dt>近 3 日</dt><dd>{{ selectedMachine.totalBet.threeDays.toLocaleString() }}</dd></div><div><dt>近 7 日</dt><dd>{{ selectedMachine.totalBet.sevenDays.toLocaleString() }}</dd></div></dl><button class="btn-gold w-full justify-center" @click="enterSelected">進入此機台</button></template>
          <div v-else class="machine-empty"><span>⌖</span><strong>選擇一台空閒機台</strong><small>點擊機台可查看統計資料</small></div>
        </aside>
      </div>
      <footer class="seat-footer"><button :disabled="page <= 1" @click="page--">上一頁</button><span>{{ page }} / {{ totalPages }}</span><button :disabled="page >= totalPages" @click="page++">下一頁</button></footer>
    </article></div></Transition>
  </Teleport>
</template>

<style scoped>
.seat-fade-enter-active,.seat-fade-leave-active{transition:opacity .2s}.seat-fade-enter-from,.seat-fade-leave-to{opacity:0}.seat-overlay{position:fixed;inset:0;z-index:1080;display:grid;place-items:center;padding:16px;background:rgba(5,0,15,.88);backdrop-filter:blur(12px)}.seat-panel{width:min(1040px,100%);max-height:94dvh;overflow:auto;border:1px solid rgba(245,200,66,.25);border-radius:24px;background:linear-gradient(155deg,#21103a,#10051f);box-shadow:0 30px 90px rgba(0,0,0,.65)}.seat-header{display:grid;grid-template-columns:90px 1fr 40px;align-items:center;padding:18px 22px;border-bottom:1px solid var(--color-border)}.seat-header>div{text-align:center}.seat-header p{margin:0;color:var(--color-gold);font-size:8px;font-weight:900;letter-spacing:.18em}.seat-header h2{margin:3px 0;font-size:20px}.seat-back,.seat-close{color:var(--color-text-muted);background:none;font-size:11px}.seat-close{font-size:24px}.seat-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 22px}.seat-toolbar>span{color:var(--color-text-muted);font-size:10px}.seat-status-tabs{display:flex;gap:6px}.seat-status-tabs button{padding:7px 11px;border:1px solid var(--color-border);border-radius:9px;color:var(--color-text-muted);background:rgba(168,85,247,.06);font-size:10px;font-weight:800}.seat-status-tabs button.active{border-color:rgba(245,200,66,.4);color:var(--color-gold);background:rgba(245,200,66,.09)}.seat-notice{margin:0 22px 10px;padding:8px 11px;border:1px solid rgba(74,222,128,.24);border-radius:9px;color:#86efac;background:rgba(74,222,128,.08);font-size:10px}.seat-body{display:grid;grid-template-columns:1fr 250px;gap:14px;padding:0 22px}.machine-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}.machine-seat{position:relative;display:flex;min-height:75px;flex-direction:column;align-items:center;justify-content:center;padding:7px 3px;border:1px solid rgba(74,222,128,.22);border-radius:10px;color:#fff;background:rgba(74,222,128,.07)}.machine-seat>span{font-size:15px;font-weight:900}.machine-seat>strong{color:#86efac;font-size:8px}.machine-seat>small{max-width:100%;overflow:hidden;color:var(--color-text-muted);font-size:7px;text-overflow:ellipsis;white-space:nowrap}.machine-seat.status-occupied{border-color:rgba(248,113,113,.2);background:rgba(248,113,113,.06)}.machine-seat.status-occupied>strong{color:#fca5a5}.machine-seat.status-maintenance{opacity:.48;border-color:rgba(148,163,184,.2)}.machine-seat.selected{border-color:var(--color-gold);background:rgba(245,200,66,.14);box-shadow:0 0 0 2px rgba(245,200,66,.12)}.reserve-mini{position:absolute;right:3px;bottom:3px;padding:2px 4px;border-radius:4px;color:#fca5a5;background:rgba(248,113,113,.12);font-size:6px}.machine-seat.reserved{box-shadow:inset 0 0 0 1px rgba(245,200,66,.45)}.machine-detail{min-height:310px;padding:18px;border:1px solid var(--color-border);border-radius:15px;background:rgba(15,0,32,.62)}.machine-detail>p{margin:0;color:var(--color-gold);font-size:8px;font-weight:900;letter-spacing:.15em}.machine-detail h3{margin:4px 0 14px;font-size:20px}.machine-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.machine-metrics>div{padding:9px 4px;border-radius:9px;background:rgba(168,85,247,.08);text-align:center}.machine-metrics span,.machine-metrics strong{display:block}.machine-metrics span{color:var(--color-text-muted);font-size:7px}.machine-metrics strong{margin-top:3px;color:var(--color-gold);font-size:11px}.machine-detail h4{margin:16px 0 6px;font-size:10px}.machine-detail dl{margin:0 0 16px}.machine-detail dl>div{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:9px}.machine-detail dt{color:var(--color-text-muted)}.machine-detail dd{margin:0;font-weight:800}.machine-empty{display:flex;height:270px;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center}.machine-empty>span{color:var(--color-purple-light);font-size:30px}.machine-empty strong{font-size:12px}.machine-empty small{color:var(--color-text-muted);font-size:9px}.seat-footer{display:flex;align-items:center;justify-content:center;gap:14px;padding:14px}.seat-footer button{padding:7px 12px;border:1px solid var(--color-border);border-radius:8px;color:var(--color-text-muted);font-size:9px}.seat-footer button:disabled{opacity:.3}.seat-footer span{font-size:10px;font-weight:800}
@media(max-width:800px){.seat-overlay{align-items:end;padding:0}.seat-panel{max-height:95dvh;border-radius:22px 22px 0 0}.seat-body{grid-template-columns:1fr}.machine-grid{grid-template-columns:repeat(4,1fr)}.machine-detail{min-height:0}.seat-toolbar{align-items:flex-start;flex-direction:column}.seat-toolbar>span{display:none}}@media(max-width:420px){.machine-grid{grid-template-columns:repeat(3,1fr)}.seat-header{grid-template-columns:65px 1fr 32px;padding:14px 12px}.seat-header h2{font-size:15px}.seat-body,.seat-toolbar{padding-left:12px;padding-right:12px}}
</style>
