// 排行榜即時更新計時器
export const useLeaderboardTimer = () => {
  const seconds = ref(0)
  const lastUpdate = computed(() => {
    if (seconds.value < 60) return `${seconds.value} 秒前`
    if (seconds.value < 3600) return `${Math.floor(seconds.value / 60)} 分鐘前`
    return `${Math.floor(seconds.value / 3600)} 小時前`
  })

  let timer: ReturnType<typeof setInterval> | null = null
  onMounted(() => { timer = setInterval(() => seconds.value++, 1000) })
  onUnmounted(() => { if (timer) clearInterval(timer) })

  return { seconds, lastUpdate }
}
