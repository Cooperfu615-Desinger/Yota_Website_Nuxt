export type MachineStatus = 'available' | 'occupied' | 'maintenance'

export interface GameMachine {
  id: string
  number: number
  status: MachineStatus
  player?: string
  freeGame: number
  rtp: string
  hitRate: string
  totalBet: { today: number; threeDays: number; sevenDays: number }
}

function gameSeed(gameKey: string) {
  return gameKey.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
}

export function getGameMachines(gameKey: string): GameMachine[] {
  const seed = gameSeed(gameKey)
  return Array.from({ length: 84 }, (_, index) => {
    const number = index + 1
    const maintenance = (number + seed) % 29 === 0
    const occupied = !maintenance && (number + seed) % 5 === 0
    const status: MachineStatus = maintenance ? 'maintenance' : occupied ? 'occupied' : 'available'
    const rtp = 94.5 + ((number * 17 + seed) % 38) / 10
    const hitRate = 18 + ((number * 11 + seed) % 190) / 10
    const today = 18000 + ((number * 7919 + seed * 13) % 380000)

    return {
      id: `${gameKey}-M${String(number).padStart(3, '0')}`,
      number,
      status,
      player: occupied ? `玩家***${String.fromCharCode(65 + ((number + seed) % 26))}` : undefined,
      freeGame: (number * 3 + seed) % 18,
      rtp: `${rtp.toFixed(1)}%`,
      hitRate: `${hitRate.toFixed(1)}%`,
      totalBet: { today, threeDays: today * 3 + number * 1200, sevenDays: today * 7 + number * 3600 },
    }
  })
}
