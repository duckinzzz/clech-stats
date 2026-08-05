import { useState, useMemo, useEffect } from 'react'
import { usePlayers, usePlayerBattles, toChartPoints } from '@/api/client'
import Masthead from '@/components/Masthead'
import ControlPanel from '@/components/ControlPanel'
import TrophyChart from '@/components/TrophyChart'
import RecentBattles from '@/components/RecentBattles'
import Footer from '@/components/Footer'

export default function App() {
  const {
    data: playersData,
    isLoading: playersLoading,
    isError: playersError,
  } = usePlayers()
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

  // Sync initial player selection (avoid setState during render)
  useEffect(() => {
    if (!selectedPlayer && effectivePlayer) {
      setSelectedPlayer(effectivePlayer)
    }
  }, [selectedPlayer, effectivePlayer])

  const {
    data: battlesData,
    isLoading: battlesLoading,
    isError: battlesError,
  } = usePlayerBattles(effectivePlayer, 50)

  const chartPoints = useMemo(
    () => (battlesData ? toChartPoints(battlesData) : []),
    [battlesData],
  )

  const catalog = battlesData?.catalog ?? {}

  function renderChart() {
    if (playersError) {
      return (
        <div className="flex items-center justify-center h-64 bg-bg-card border border-border rounded-lg">
          <span className="font-mono text-sm text-loss">
            Ошибка загрузки списка игроков
          </span>
        </div>
      )
    }

    if (battlesError) {
      return (
        <div className="flex items-center justify-center h-64 bg-bg-card border border-border rounded-lg">
          <span className="font-mono text-sm text-loss">
            Ошибка загрузки данных игрока
          </span>
        </div>
      )
    }

    if (battlesLoading && chartPoints.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-bg-card border border-border rounded-lg">
          <span className="font-mono text-sm text-text-muted">
            Загрузка графика...
          </span>
        </div>
      )
    }

    return <TrophyChart points={chartPoints} catalog={catalog} />
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
      {/* Layer 1: Masthead */}
      <Masthead />

      {/* Layer 2: Control panel */}
      <ControlPanel
        players={players}
        selectedPlayer={effectivePlayer}
        onPlayerChange={setSelectedPlayer}
        isLoading={playersLoading || battlesLoading}
      />

      {/* Layer 3: Main block — two columns */}
      <main className="mt-6 md:mt-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left column: chart (wider) */}
          <section className="flex-1 min-w-0">
            {renderChart()}
          </section>

          {/* Right column: recent battles (sticky on desktop) */}
          <aside className="lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-6">
              <RecentBattles />
            </div>
          </aside>
        </div>
      </main>

      {/* Layer 5: Footer */}
      <Footer />
    </div>
  )
}
