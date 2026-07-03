export function usePublicAssetPath() {
  const { app: { baseURL } } = useRuntimeConfig()
  const base = baseURL.replace(/\/$/, '')
  const requestUrl = import.meta.server ? useRequestURL() : null
  const currentPath = computed(() =>
    import.meta.client ? window.location.pathname : requestUrl?.pathname ?? '/'
  )
  const routePath = computed(() => {
    if (base && currentPath.value.startsWith(`${base}/`)) {
      return currentPath.value.slice(base.length) || '/'
    }
    return currentPath.value
  })
  const assetPrefix = computed(() => {
    const depth = routePath.value.replace(/\/$/, '').split('/').filter(Boolean).length
    return depth > 0 ? '../'.repeat(depth) : ''
  })

  function resolvePublicAsset(src?: string) {
    if (!src) return ''
    const normalized = src.startsWith('/') ? src : `/${src}`
    return `${assetPrefix.value}${normalized.slice(1)}`
  }

  return {
    resolvePublicAsset,
  }
}
