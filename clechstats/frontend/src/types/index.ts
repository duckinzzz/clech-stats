/* ─── Player list ─── */

export interface PlayerItem {
  tag: string
  name: string
}

export interface PlayerListResponse {
  players: PlayerItem[]
}

/* ─── Recent battles ─── */

export interface RecentBattle {
  player: string
  before: number
  change: number
  battle_time: string
}

export interface RecentBattlesResponse {
  battles: RecentBattle[]
}

/* ─── Player battle history ─── */

export interface CardRef {
  id: number
  level: number
  isEvo: boolean
}

export interface CardInfo {
  name: string
  rarity: string
  elixirCost: number
  iconUrls: {
    medium: string
  }
}

export interface BattleInfo {
  player: {
    crowns: number
    cards: CardRef[]
  }
  enemy: {
    nickname: string
    crowns: number
    cards: CardRef[]
  }
}

export interface CustomPoint {
  battle_time: string
  change: number
  enemy: string
  battle_info: BattleInfo
}

export interface PlayerBattlesPayload {
  x: number[]
  y: number[]
  custom: CustomPoint[]
}

export interface PlayerBattlesResponse {
  player: PlayerBattlesPayload
  catalog: Record<number, CardInfo>
}

/* ─── Chart data point (derived) ─── */

export interface ChartPoint {
  x: number
  y: number
  change: number
  battleTime: string
  enemy: string
  battleInfo: BattleInfo
  isWin: boolean
  isLoss: boolean
}
