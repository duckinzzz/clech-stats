import type { ChartPoint, CardInfo } from '@/types'
import { formatBattleTime } from '@/lib/utils'

interface BattleTooltipProps {
  point: ChartPoint
  catalog: Record<number, CardInfo>
}

function avg(arr: number[]): string {
  if (arr.length === 0) return '—'
  return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)
}

function CardGrid({
  cards,
  catalog,
}: {
  cards: { id: number; level: number; isEvo: boolean }[]
  catalog: Record<number, CardInfo>
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {cards.map((card, i) => {
        const info = catalog[card.id]
        const iconUrl = info?.iconUrls?.medium ?? ''
        return (
          <div
            key={`${card.id}-${i}`}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="relative w-9 h-9 rounded bg-white/10 overflow-hidden">
              {iconUrl && (
                <img
                  src={iconUrl}
                  alt={info?.name ?? `Card ${card.id}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              {card.isEvo && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-purple-400 border border-tooltip-bg" />
              )}
            </div>
            <span className="font-mono text-[10px] text-white/60 tabular-nums leading-none">
              {card.level}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function BattleTooltip({
  point,
  catalog,
}: BattleTooltipProps) {
  const { battleInfo } = point
  if (!battleInfo) return null

  const { player, enemy } = battleInfo
  const playerLevels = player.cards.map((c) => c.level)
  const enemyLevels = enemy.cards.map((c) => c.level)
  const playerElixir = player.cards
    .map((c) => (catalog[c.id]?.elixirCost ?? 0))
    .filter(Boolean)
  const enemyElixir = enemy.cards
    .map((c) => (catalog[c.id]?.elixirCost ?? 0))
    .filter(Boolean)

  const resultText = point.isWin ? 'Победа' : point.isLoss ? 'Поражение' : 'Ничья'
  const resultColor = point.isWin
    ? 'var(--color-win)'
    : point.isLoss
      ? 'var(--color-loss)'
      : 'var(--color-text-muted)'

  return (
    <div
      className="w-72 rounded-lg shadow-2xl p-4 font-sans text-white"
      style={{ backgroundColor: 'var(--color-tooltip-bg)' }}
    >
      {/* Header: opponent, result, time */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium leading-tight">
            vs {enemy.nickname}
          </div>
          <div className="font-mono text-[10px] text-white/50 mt-0.5">
            {formatBattleTime(point.battleTime)}
          </div>
        </div>
        <span
          className="font-mono text-[11px] uppercase tracking-wider font-medium"
          style={{ color: resultColor }}
        >
          {resultText}
        </span>
      </div>

      {/* Score */}
      <div className="flex items-center justify-center gap-3 mb-3 py-2 border-y border-white/10">
        <span className="font-serif text-3xl tabular-nums">
          {player.crowns}
        </span>
        <span className="font-serif text-xl text-white/30">:</span>
        <span className="font-serif text-3xl tabular-nums">
          {enemy.crowns}
        </span>
      </div>

      {/* Decks side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Player cards */}
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-white/40 mb-1.5">
            Вы
          </div>
          <CardGrid cards={player.cards} catalog={catalog} />
          <div className="mt-1.5 space-y-0.5 font-mono text-[9px] text-white/50 tabular-nums">
            <div>Ср.ур: {avg(playerLevels)}</div>
            <div>Ср.💧: {avg(playerElixir)}</div>
          </div>
        </div>

        {/* Enemy cards */}
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-white/40 mb-1.5">
            {enemy.nickname}
          </div>
          <CardGrid cards={enemy.cards} catalog={catalog} />
          <div className="mt-1.5 space-y-0.5 font-mono text-[9px] text-white/50 tabular-nums">
            <div>Ср.ур: {avg(enemyLevels)}</div>
            <div>Ср.💧: {avg(enemyElixir)}</div>
          </div>
        </div>
      </div>

      {/* Trophy change */}
      <div className="mt-3 pt-2 border-t border-white/10 text-center">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-wider">
          Трофеи
        </span>
        <div
          className="font-mono text-sm tabular-nums font-medium mt-0.5"
          style={{ color: resultColor }}
        >
          {point.change > 0 ? '+' : ''}
          {point.change}
        </div>
      </div>
    </div>
  )
}
