import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type {
  PlayerListResponse,
  PlayerBattlesResponse,
  RecentBattlesResponse,
  PlayersSummaryResponse,
  ChartPoint,
  PlayerSummary,
} from '@/types'

/* ─── fetch helpers ─── */

const BASE = '/api'

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

/* ─── query keys ─── */

export const queryKeys = {
  players: ['players'] as const,
  playersSummary: ['playersSummary'] as const,
  playerBattles: (name: string, limit: number) =>
    ['playerBattles', name, limit] as const,
  recentBattles: (limit: number) => ['recentBattles', limit] as const,
}

/* ─── hooks ─── */

export function usePlayers() {
  return useQuery<PlayerListResponse>({
    queryKey: queryKeys.players,
    queryFn: () => fetchJson<PlayerListResponse>(`${BASE}/players/`),
    staleTime: Infinity, // player list rarely changes
  })
}

export function usePlayersSummary() {
  return useQuery<PlayersSummaryResponse>({
    queryKey: queryKeys.playersSummary,
    queryFn: () => fetchJson<PlayersSummaryResponse>(`${BASE}/players/summary/`),
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

export function usePlayerBattles(name: string, limit: number = 30) {
  return useQuery<PlayerBattlesResponse>({
    queryKey: queryKeys.playerBattles(name, limit),
    queryFn: () =>
      fetchJson<PlayerBattlesResponse>(
        `${BASE}/players/${encodeURIComponent(name)}/battles/?limit=${limit}`,
      ),
    enabled: !!name,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

export function useRecentBattles(limit: number = 10) {
  return useQuery<RecentBattlesResponse>({
    queryKey: queryKeys.recentBattles(limit),
    queryFn: () =>
      fetchJson<RecentBattlesResponse>(
        `${BASE}/battles/recent/?limit=${limit}`,
      ),
    refetchInterval: 60_000,
    staleTime: 30_000,
  })
}

/* ─── derived data helpers ─── */

export function toChartPoints(data: PlayerBattlesResponse): ChartPoint[] {
  const { player } = data
  return player.x.map((x, i) => {
    const change = player.custom[i]?.change ?? 0
    return {
      x,
      y: player.y[i],
      change,
      battleTime: player.custom[i]?.battle_time ?? '',
      enemy: player.custom[i]?.enemy ?? '',
      battleInfo: player.custom[i]?.battle_info,
      isWin: change > 0,
      isLoss: change < 0,
    }
  })
}

export function summarize(points: ChartPoint[]): PlayerSummary | null {
  if (points.length === 0) return null

  const wins = points.filter((p) => p.isWin).length
  const losses = points.filter((p) => p.isLoss).length
  const first = points[0]
  const last = points[points.length - 1]

  let streak: PlayerSummary['streak'] = null
  const lastResult = last.isWin ? 'win' : last.isLoss ? 'loss' : null
  if (lastResult) {
    let count = 0
    for (let i = points.length - 1; i >= 0; i--) {
      const isSame = lastResult === 'win' ? points[i].isWin : points[i].isLoss
      if (!isSame) break
      count++
    }
    streak = { result: lastResult, count }
  }

  return {
    current: last.y,
    delta: last.y - first.y,
    wins,
    losses,
    battles: points.length,
    lastBattle: last.battleTime,
    streak,
  }
}
