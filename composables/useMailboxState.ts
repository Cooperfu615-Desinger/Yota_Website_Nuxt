import type { WalletKey } from '~/utils/wallets'

export interface MailReward { wallet: WalletKey; amount: number; label: string; claimed: boolean }
export interface InboxMessage {
  id: number; title: string; preview: string; body: string; time: string; read: boolean
  type: 'system' | 'event' | 'deposit'; reward?: MailReward
}

function initialMessages(): InboxMessage[] {
  return [
    { id: 1, title: '夏日登入獎勵', preview: '感謝持續登入，附件含 50,000 金幣。', body: '夏日限定登入回饋已送達，請於本封信件中領取附件。', time: '2 小時前', read: false, type: 'event', reward: { wallet: 'gold', amount: 50000, label: '金幣 50,000', claimed: false } },
    { id: 2, title: '百萬大獎賽開始', preview: '排行榜活動正式開跑。', body: '倍數榜、贏分榜與富豪榜同步開跑，把握活動期間累積成績。', time: '5 小時前', read: false, type: 'event' },
    { id: 3, title: '儲值到帳確認', preview: '您的 Mock 儲值已成功到帳。', body: '儲值流程已完成，可至獨立的交易紀錄頁查看操作結果。', time: '昨天', read: true, type: 'deposit', reward: { wallet: 'silver', amount: 10000, label: '銀幣 10,000', claimed: false } },
    { id: 4, title: '例行維護公告', preview: '每日 05:00–05:30 進行例行維護。', body: '維護期間部分遊戲可能暫時無法進入，請妥善安排遊戲時間。', time: '2 天前', read: true, type: 'system' },
  ]
}

export const useMailboxState = () => {
  const messages = useState<InboxMessage[]>('mailboxMessages', initialMessages)
  const { addWalletReward } = useFinancialState()

  function markRead(id: number) { const item = messages.value.find(message => message.id === id); if (item) item.read = true }
  function deleteMessage(id: number) { messages.value = messages.value.filter(message => message.id !== id) }

  function claimMailReward(id: number) {
    const message = messages.value.find(item => item.id === id)
    if (!message?.reward || message.reward.claimed) return false
    message.reward.claimed = true
    addWalletReward(message.reward.wallet, message.reward.amount, '信箱附件領取', message.title)
    return true
  }

  return { messages, markRead, deleteMessage, claimMailReward }
}
