import { useState, useMemo, useEffect } from 'react'
import {
  usePlayers,
  usePlayersSummary,
  usePlayerBattles,
  toChartPoints,
  summarize,
} from '@/api/client'
import Masthead from '@/components/Masthead'
import ControlPanel from '@/components/ControlPanel'
import TrophyChart from '@/components/TrophyChart'
import RecentBattles from '@/components/RecentBattles'

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[260px] items-center justify-center border-y border-line text-[13px] text-faint">
      {children}
    </div>
  )
}

export default function App() {
  const {
    data: playersData,
    isError: playersError,
  } = usePlayers()
  const { data: summaryData } = usePlayersSummary()
  const players = playersData?.players ?? []

  const [selectedPlayer, setSelectedPlayer] = useState<string>('')

  // Default to first player when data loads
  const effectivePlayer = useMemo(() => {
    if (selectedPlayer && players.some((p) => p.name === selectedPlayer)) {
      return selectedPlayer
    }
    if (players.length > 0) return players[0].name
    return ''
  }, [players, selectedPlayer])

  useEffect(() => {
    if (!selectedPlayer && effectivePlayer) {
      setSelectedPlayer(effectivePlayer)
    }
  }, [selectedPlayer, effectivePlayer])

  const {
    data: battlesData,
    isLoading: battlesLoading,
    isFetching: battlesFetching,
    isError: battlesError,
  } = usePlayerBattles(effectivePlayer, 50)

  const chartPoints = useMemo(
    () => (battlesData ? toChartPoints(battlesData) : []),
    [battlesData],
  )
  const summary = useMemo(() => summarize(chartPoints), [chartPoints])
  const catalog = battlesData?.catalog ?? {}

  function renderChart() {
    if (playersError) return <Notice>Не удалось загрузить список игроков</Notice>
    if (battlesError) return <Notice>Не удалось загрузить бои игрока</Notice>
    if (battlesLoading && chartPoints.length === 0) {
      return <Notice>Загрузка графика…</Notice>
    }
    if (chartPoints.length === 0) {
      return <Notice>У этого игрока пока нет записанных боёв</Notice>
    }
    return <TrophyChart points={chartPoints} catalog={catalog} />
  }

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-12 sm:px-8 lg:px-10">
      <Masthead playerName={effectivePlayer} summary={summary} />

      <ControlPanel
        players={players}
        overview={summaryData?.players ?? []}
        selectedPlayer={effectivePlayer}
        onPlayerChange={setSelectedPlayer}
      />

      <main className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div
          className={`min-w-0 transition-opacity ${battlesFetching && chartPoints.length > 0 ? 'opacity-60' : ''}`}
        >
          {renderChart()}
        </div>
        <aside>
          <div className="lg:sticky lg:top-6">
            <RecentBattles />
          </div>
        </aside>
      </main>
    </div>
  )
}
