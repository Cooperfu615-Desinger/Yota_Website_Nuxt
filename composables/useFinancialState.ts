import { calculateVaultTransfer, canSubmitVaultTransfer } from '~/utils/vaultTransfer'
import {
  calculateWalletExchange,
  canSubmitWalletExchange,
  type WalletExchangeDirection,
} from '~/utils/walletExchange'
import { DEFAULT_WALLET_BALANCE, type WalletKey } from '~/utils/wallets'

export type FinancialTransactionType = 'deposit' | 'vault' | 'gift' | 'exchange' | 'reward'
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
}

export interface FinancialState {
  balance: number
  silverBalance: number
  bronzeBalance: number
  vaultBalance: number
  transactions: FinancialTransaction[]
}

function createInitialTransactions(): FinancialTransaction[] {
  return [
    {
      id: 'TX-MOCK-001',
      type: 'deposit',
      title: '信用卡儲值',
      amount: 1150,
      wallet: 'gold',
      status: 'success',
      createdAt: '2026/07/18 20:15',
      detail: 'NT$1,000 儲值方案',
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
      detail: 'NT$5,000 儲值方案',
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

  function transferFromVault(receiverId: string, amount: number) {
    if (!canSubmitVaultTransfer(receiverId, amount, financialState.value.vaultBalance)) return null
    const transfer = calculateVaultTransfer(amount)
    financialState.value.vaultBalance -= transfer.amount
    addTransaction({
      type: 'gift',
      title: '贈禮給玩家',
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
    completeDeposit,
    depositToVault,
    withdrawFromVault,
    transferFromVault,
    exchangeWalletCurrency,
    resetFinancialState,
  }
}
