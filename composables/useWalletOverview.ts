import { siteContent } from '~/data/siteContent'
import { getExchangeableSilver } from '~/utils/walletOverview'

export function useWalletOverview() {
  const { userInfo } = useAppState()
  const demo = siteContent.walletOverview.demo
  const spendable = computed(() => Math.max(0, userInfo.value.silverBalance - demo.unsettledSilver))
  const available = computed(() => getExchangeableSilver(userInfo.value.silverBalance, demo.unsettledSilver, demo.quota))
  const limitReason = computed(() => {
    if (Number(demo.quota) === 0) return '目前沒有兌換額度；完成下方流水後才會增加。'
    if (spendable.value === 0) return '目前沒有可扣用銀幣；已取得的額度仍會保留。'
    if (spendable.value < demo.quota) return '目前以可扣用的銀幣餘額為上限，未使用額度會保留。'
    return '目前以剩餘兌換額度為上限，其他銀幣仍可用於遊戲。'
  })

  return { demo, spendable, available, limitReason }
}
