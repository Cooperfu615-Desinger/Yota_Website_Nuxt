import { normalizePromoCode, PROMO_CODES, PROMO_CURRENCY_LABELS, validatePromoCode, type PromoCode } from '~/data/promoCodes'

export interface PromoCodeResult {
  promo: PromoCode | null
  error: string | null
}

export const usePromoCodeState = () => {
  const { isLoggedIn, userInfo } = useAppState()
  const financial = useFinancialState()
  const rewardCards = useRewardCardState()
  const claimsByMember = useState<Record<string, string[]>>('promoCodeClaims', () => ({}))
  const activityGoldByMember = useState<Record<string, number>>('activityGoldBalances', () => ({}))

  const memberKey = computed(() => isLoggedIn.value
    ? `${userInfo.value.authProvider}:${userInfo.value.account}`
    : '')
  const claimedCodes = computed(() => memberKey.value ? (claimsByMember.value[memberKey.value] ?? []) : [])
  const activityGoldBalance = computed(() => memberKey.value ? (activityGoldByMember.value[memberKey.value] ?? 0) : 0)

  function preview(value: string): PromoCodeResult {
    const error = validatePromoCode(value, isLoggedIn.value && userInfo.value.authProvider !== 'guest', new Set(claimedCodes.value))
    const promo = error ? null : PROMO_CODES.find(item => item.code === normalizePromoCode(value)) ?? null
    return { promo, error }
  }

  function redeem(value: string): PromoCodeResult {
    const checked = preview(value)
    if (checked.error || !checked.promo || !memberKey.value) return checked

    const code = checked.promo.code
    const key = memberKey.value
    claimsByMember.value = { ...claimsByMember.value, [key]: [...claimedCodes.value, code] }
    const promo = checked.promo
    const source = `優惠碼 ${code}・${promo.title}`
    let granted = false

    if (promo.currency === 'activity-gold') {
      activityGoldByMember.value = {
        ...activityGoldByMember.value,
        [key]: activityGoldBalance.value + promo.amount,
      }
      granted = Boolean(financial.recordActivityReward('activity-gold', promo.amount, '優惠碼獎勵', source))
    } else if (promo.currency === 'activity-silver') {
      granted = rewardCards.grantPromoRewardCard({
        id: `promo-${key}-${code}`,
        milestoneDay: 0,
        title: promo.title,
        currency: 'activity-silver',
        amount: promo.amount,
        totalTurnover: 0,
        turnoverTarget: promo.turnoverTarget ?? 0,
        conversionLimit: promo.conversionLimit ?? 0,
        expiresAt: promo.cardExpiresAt ?? promo.endsAt.slice(0, 10).replace(/-/g, '/'),
      }, source)
      if (granted) financial.recordActivityReward('activity-silver', promo.amount, '優惠碼獎勵', source)
    } else {
      granted = Boolean(financial.addWalletReward(promo.currency, promo.amount, '優惠碼獎勵', `${source}・${PROMO_CURRENCY_LABELS[promo.currency]}`))
    }

    if (!granted) {
      const nextClaims = claimsByMember.value[key].filter(item => item !== code)
      const nextClaimsByMember = { ...claimsByMember.value }
      if (nextClaims.length) nextClaimsByMember[key] = nextClaims
      else delete nextClaimsByMember[key]
      claimsByMember.value = nextClaimsByMember
      if (promo.currency === 'activity-gold') {
        const nextBalances = { ...activityGoldByMember.value }
        nextBalances[key] = Math.max(0, (nextBalances[key] ?? 0) - promo.amount)
        activityGoldByMember.value = nextBalances
      }
      return { promo: null, error: '目前無法領取，請重新確認優惠碼或獎勵期限。' }
    }

    return { promo, error: null }
  }

  return { claimedCodes, activityGoldBalance, preview, redeem }
}
