// Banner 輪播：觸控滑動 + 自動播放
export const useBannerSlider = (total: number, interval = 4000) => {
  const current = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null
  let touchStartX = 0

  const slideStyle = computed(() => ({
    transform: `translateX(-${current.value * 100}%)`,
  }))

  function next() {
    current.value = (current.value + 1) % total
  }
  function prev() {
    current.value = (current.value - 1 + total) % total
  }
  function goTo(index: number) {
    current.value = index
  }

  function startAuto() {
    if (timer) clearInterval(timer)
    timer = setInterval(next, interval)
  }
  function stopAuto() {
    if (timer) clearInterval(timer)
    timer = null
  }

  // Touch handlers
  function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0].clientX
    stopAuto()
  }
  function onTouchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    startAuto()
  }

  onMounted(() => startAuto())
  onUnmounted(() => stopAuto())

  return { current, total, slideStyle, next, prev, goTo, onTouchStart, onTouchEnd }
}
