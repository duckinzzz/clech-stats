import { useQuery } from '@tanstack/react-query'
import type {
  PlayerListResponse,
  PlayerBattlesResponse,
  RecentBattlesResponse,
  ChartPoint,
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

export function usePlayerBattles(name: string, limit: number = 30) {
  return useQuery<PlayerBattlesResponse>({
    queryKey: queryKeys.playerBattles(name, limit),
    queryFn: () =>
      fetchJson<PlayerBattlesResponse>(
        `${BASE}/players/${encodeURIComponent(name)}/battles/?limit=${limit}`,
      ),
    enabled: !!name,
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
