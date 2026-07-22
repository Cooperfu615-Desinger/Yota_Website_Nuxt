export function usePublicAssetPath() {
  const { app: { baseURL } } = useRuntimeConfig()
  const assetBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`

  function resolvePublicAsset(src?: string) {
    if (!src) return ''
    if (/^(?:https?:)?\/\//.test(src) || /^(?:data|blob):/.test(src)) return src
    return `${assetBase}${src.replace(/^\/+/, '')}`
  }

  return {
    resolvePublicAsset,
  }
}
