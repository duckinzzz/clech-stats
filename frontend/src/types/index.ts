/* ─── Player list ─── */

export interface PlayerItem {
  tag: string
  name: string
}

export interface PlayerListResponse {
  players: PlayerItem[]
}

/* ─── Scoreboard strip ─── */

export interface PlayerOverview {
  tag: string
  name: string
  trophies: number | null
  delta: number
  battles: number
  last_battle: string | null
}

export interface PlayersSummaryResponse {
  players: PlayerOverview[]
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

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'champion'

export interface CardRef {
  id: number
  level: number
  maxLevel?: number | null
  isEvo: boolean
  evoLevel: number
  iconUrl: string
}

export interface CardInfo {
  name: string
  rarity: Rarity
  elixirCost: number
  iconUrls: {
    medium: string
    evolutionMedium?: string
    heroMedium?: string
  }
}

export interface BattleSide {
  crowns: number
  cards: CardRef[]
}

export interface BattleInfo {
  player: BattleSide & { nickname?: string }
  enemy: BattleSide & { nickname: string }
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

/* ─── Player summary (derived) ─── */

export interface PlayerSummary {
  current: number
  delta: number
  wins: number
  losses: number
  battles: number
  lastBattle: string
  streak: { result: 'win' | 'loss'; count: number } | null
}
