import { calculateVaultTransfer, canSubmitVaultTransfer } from '~/utils/vaultTransfer'
import {
  calculateWalletExchange,
  canSubmitWalletExchange,
  type WalletExchangeDirection,
} from '~/utils/walletExchange'
import { DEFAULT_WALLET_BALANCE, type WalletKey } from '~/utils/wallets'
import { calculateWalletSpend } from '~/utils/walletSpend'

export type FinancialTransactionType = 'deposit' | 'vault' | 'gift' | 'exchange' | 'reward' | 'spend'
export type FinancialTransactionStatus = 'success' | 'processing' | 'failed'

export interface FinancialTransaction {
  id: string
  type: FinancialTransactionType
  title: string
  amount: number
  wallet: WalletKey
  status: FinancialTransactionStatus
  createdAt: string
  detail?: string
  referenceId?: string
}

export interface FinancialState {
  balance: number
  silverBalance: number
  bronzeBalance: number
  vaultBalance: number
  transactions: FinancialTransaction[]
}

interface GiftRefundTransaction {
  title: string
  detail?: string
}

export interface GiftTransactionParty {
  name: string
  account: string
}

export interface GiftSuccessSnapshot {
  requestId: string
  amount: number
  fee: number
  actualReceived: number
}

function createInitialTransactions(): FinancialTransaction[] {
  return [
    {
      id: 'TX-MOCK-004',
      type: 'gift',
      title: '收到贈禮',
      amount: 90_250,
      wallet: 'gold',
      status: 'success',
      createdAt: '2026/07/27 18:42',
      detail: '來自 JokerAce（@JokerAce14）・原額 95,000・手續費 4,750・GIFT-HISTORY-001',
      referenceId: 'GIFT-HISTORY-001',
    },
    {
      id: 'TX-MOCK-005',
      type: 'gift',
      title: '贈禮成功',
      amount: -50_000,
      wallet: 'gold',
      status: 'success',
      createdAt: '2026/07/26 18:05',
      detail: '贈送給 富貴吉祥（@富貴吉祥88）・對方實收 47,500・手續費 2,500・GIFT-HISTORY-002',
      referenceId: 'GIFT-HISTORY-002',
    },
    {
      id: 'TX-MOCK-001',
      type: 'deposit',
      title: '信用卡儲值',
      amount: 1150,
      wallet: 'gold',
      status: 'success',
      createdAt: '2026/07/18 20:15',
      detail: '1,150 金幣儲值方案',
    },
    {
      id: 'TX-MOCK-002',
      type: 'reward',
      title: '信箱附件領取',
      amount: 50000,
      wallet: 'gold',
      status: 'success',
      createdAt: '2026/07/17 12:40',
      detail: '夏日登入獎勵',
    },
    {
      id: 'TX-MOCK-003',
      type: 'deposit',
      title: 'ATM 儲值',
      amount: 6200,
      wallet: 'gold',
      status: 'processing',
      createdAt: '2026/07/16 09:30',
      detail: '6,200 金幣儲值方案',
    },
  ]
}

function createInitialFinancialState(): FinancialState {
  return {
    balance: DEFAULT_WALLET_BALANCE,
    silverBalance: DEFAULT_WALLET_BALANCE,
    bronzeBalance: DEFAULT_WALLET_BALANCE,
    vaultBalance: 0,
    transactions: createInitialTransactions(),
  }
}

function formatTimestamp() {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date()).replace(/\//g, '/')
}

export const useFinancialState = () => {
  // 金融 Mock 只存在本次瀏覽工作階段；重新整理頁面會回到初始值。
  const financialState = useState<FinancialState>('financialState', createInitialFinancialState)
  const transactionSequence = useState('financialTransactionSequence', () => 100)

  const balance = computed(() => financialState.value.balance)
  const silverBalance = computed(() => financialState.value.silverBalance)
  const bronzeBalance = computed(() => financialState.value.bronzeBalance)
  const vaultBalance = computed(() => financialState.value.vaultBalance)
  const transactions = computed(() => financialState.value.transactions)

  function nextTransactionId() {
    transactionSequence.value += 1
    return `TX-${String(transactionSequence.value).padStart(6, '0')}`
  }

  function addTransaction(input: Omit<FinancialTransaction, 'id' | 'createdAt'>) {
    const transaction: FinancialTransaction = {
      ...input,
      id: nextTransactionId(),
      createdAt: formatTimestamp(),
    }
    financialState.value.transactions = [transaction, ...financialState.value.transactions]
    return transaction
  }

  function findGiftSuccessTransaction(requestId: string, title: string) {
    return financialState.value.transactions.find(transaction =>
      transaction.type === 'gift'
      && transaction.referenceId === requestId
      && transaction.title === title,
    )
  }

  function addWalletReward(wallet: WalletKey, amount: number, title: string, detail?: string) {
    const normalizedAmount = Math.max(0, Math.floor(amount))
    if (!normalizedAmount) return null

    if (wallet === 'gold') financialState.value.balance += normalizedAmount
    if (wallet === 'silver') financialState.value.silverBalance += normalizedAmount
    if (wallet === 'bronze') financialState.value.bronzeBalance += normalizedAmount

    return addTransaction({
      type: 'reward',
      title,
      amount: normalizedAmount,
      wallet,
      status: 'success',
      detail,
    })
  }

  function spendWalletBalance(wallet: WalletKey, amount: number, title: string, detail?: string) {
    const currentBalance = wallet === 'gold'
      ? financialState.value.balance
      : wallet === 'silver'
        ? financialState.value.silverBalance
        : financialState.value.bronzeBalance
    const spend = calculateWalletSpend(currentBalance, amount)
    if (!spend) return null

    if (wallet === 'gold') financialState.value.balance = spend.remainingBalance
    if (wallet === 'silver') financialState.value.silverBalance = spend.remainingBalance
    if (wallet === 'bronze') financialState.value.bronzeBalance = spend.remainingBalance

    return addTransaction({
      type: 'spend',
      title,
      amount: -spend.spentAmount,
      wallet,
      status: 'success',
      detail,
    })
  }

  function completeDeposit(points: number, detail: string) {
    const normalizedPoints = Math.max(0, Math.floor(points))
    if (!normalizedPoints) return null
    financialState.value.balance += normalizedPoints
    return addTransaction({
      type: 'deposit',
      title: '儲值成功',
      amount: normalizedPoints,
      wallet: 'gold',
      status: 'success',
      detail,
    })
  }

  function depositToVault(amount: number) {
    const normalizedAmount = Math.floor(amount)
    if (normalizedAmount <= 0 || normalizedAmount > financialState.value.balance) return false
    financialState.value.balance -= normalizedAmount
    financialState.value.vaultBalance += normalizedAmount
    addTransaction({
      type: 'vault',
      title: '存入保險箱',
      amount: -normalizedAmount,
      wallet: 'gold',
      status: 'success',
    })
    return true
  }

  function withdrawFromVault(amount: number) {
    const normalizedAmount = Math.floor(amount)
    if (normalizedAmount <= 0 || normalizedAmount > financialState.value.vaultBalance) return false
    financialState.value.vaultBalance -= normalizedAmount
    financialState.value.balance += normalizedAmount
    addTransaction({
      type: 'vault',
      title: '保險箱取出',
      amount: normalizedAmount,
      wallet: 'gold',
      status: 'success',
    })
    return true
  }

  function reserveGiftFromVault(amount: number) {
    const normalizedAmount = Math.floor(amount)
    if (normalizedAmount <= 0 || normalizedAmount > financialState.value.vaultBalance) return false
    financialState.value.vaultBalance -= normalizedAmount
    return true
  }

  function refundGiftToVault(amount: number, transaction?: GiftRefundTransaction) {
    const normalizedAmount = Math.max(0, Math.floor(amount))
    if (!normalizedAmount) return false
    financialState.value.vaultBalance += normalizedAmount
    if (transaction) {
      addTransaction({
        type: 'gift',
        title: transaction.title,
        amount: normalizedAmount,
        wallet: 'gold',
        status: 'success',
        detail: transaction.detail,
      })
    }
    return true
  }

  function receiveGiftToWallet(sender: GiftTransactionParty, snapshot: GiftSuccessSnapshot) {
    const existing = findGiftSuccessTransaction(snapshot.requestId, '收到贈禮')
    if (existing) return existing

    const normalizedAmount = Math.max(0, Math.floor(snapshot.actualReceived))
    if (!normalizedAmount) return null
    financialState.value.balance += normalizedAmount
    return addTransaction({
      type: 'gift',
      title: '收到贈禮',
      amount: normalizedAmount,
      wallet: 'gold',
      status: 'success',
      detail: `來自 ${sender.name}（@${sender.account}）・原額 ${snapshot.amount.toLocaleString()}・手續費 ${snapshot.fee.toLocaleString()}・${snapshot.requestId}`,
      referenceId: snapshot.requestId,
    })
  }

  function recordSentGiftSuccess(receiver: GiftTransactionParty, snapshot: GiftSuccessSnapshot) {
    const existing = findGiftSuccessTransaction(snapshot.requestId, '贈禮成功')
    if (existing) return existing

    const normalizedAmount = Math.max(0, Math.floor(snapshot.amount))
    if (!normalizedAmount) return null
    return addTransaction({
      type: 'gift',
      title: '贈禮成功',
      amount: -normalizedAmount,
      wallet: 'gold',
      status: 'success',
      detail: `贈送給 ${receiver.name}（@${receiver.account}）・對方實收 ${snapshot.actualReceived.toLocaleString()}・手續費 ${snapshot.fee.toLocaleString()}・${snapshot.requestId}`,
      referenceId: snapshot.requestId,
    })
  }

  function transferFromVault(receiverId: string, amount: number) {
    if (!canSubmitVaultTransfer(receiverId, amount, financialState.value.vaultBalance)) return null
    const transfer = calculateVaultTransfer(amount)
    financialState.value.vaultBalance -= transfer.amount
    addTransaction({
      type: 'gift',
      title: '贈禮成功',
      amount: -transfer.amount,
      wallet: 'gold',
      status: 'success',
      detail: `收禮者 ${receiverId.trim()}・手續費 ${transfer.fee.toLocaleString()}`,
    })
    return { receiverId: receiverId.trim(), ...transfer }
  }

  function exchangeWalletCurrency(direction: WalletExchangeDirection, amount: number) {
    const sourceBalance = direction === 'gold-to-silver'
      ? financialState.value.balance
      : financialState.value.silverBalance
    if (!canSubmitWalletExchange(direction, amount, sourceBalance)) return null

    const exchange = calculateWalletExchange(direction, amount)
    if (direction === 'gold-to-silver') {
      financialState.value.balance -= exchange.fromAmount
      financialState.value.silverBalance += exchange.toAmount
    } else {
      financialState.value.silverBalance -= exchange.fromAmount
      financialState.value.balance += exchange.toAmount
    }
    addTransaction({
      type: 'exchange',
      title: direction === 'gold-to-silver' ? '金幣兌換銀幣' : '銀幣兌換金幣',
      amount: exchange.toAmount,
      wallet: direction === 'gold-to-silver' ? 'silver' : 'gold',
      status: 'success',
      detail: `${exchange.fromAmount.toLocaleString()} → ${exchange.toAmount.toLocaleString()}`,
    })
    return exchange
  }

  function resetFinancialState() {
    financialState.value = createInitialFinancialState()
    transactionSequence.value = 100
  }

  return {
    financialState,
    balance,
    silverBalance,
    bronzeBalance,
    vaultBalance,
    transactions,
    addTransaction,
    addWalletReward,
    spendWalletBalance,
    completeDeposit,
    depositToVault,
    withdrawFromVault,
    reserveGiftFromVault,
    refundGiftToVault,
    receiveGiftToWallet,
    recordSentGiftSuccess,
    transferFromVault,
    exchangeWalletCurrency,
    resetFinancialState,
  }
}
