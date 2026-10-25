import { Crown, Droplet } from 'lucide-react'
import type { ChartPoint, CardInfo, CardRef } from '@/types'
import { cn, formatBattleTime, formatDecimal, formatNumber, formatSigned } from '@/lib/utils'

interface BattleTooltipProps {
  point?: ChartPoint
  catalog: Record<number, CardInfo>
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function CardTile({ card, info }: { card: CardRef; info?: CardInfo }) {
  const name = info?.name ?? 'Карта'
  const icon = card.iconUrl || info?.iconUrls.medium

  return (
    <div
      className="relative aspect-[285/420] w-full overflow-hidden rounded-[2px]"
      title={`${name}, ${card.level} ур.${card.isEvo ? ', эволюция' : ''}`}
    >
      {icon ? (
        <img
          src={icon}
          alt={`${name}, ${card.level} уровень`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      ) : (
        <span className="grid h-full w-full place-items-center text-[10px] text-faint">
          ?
        </span>
      )}

      <span className="nums absolute right-[4%] bottom-[5%] bg-arena-deep/90 px-1 py-px text-[10px] leading-[1.3] font-semibold text-ink">
        {card.level}
      </span>
    </div>
  )
}

function Deck({
  label,
  crowns,
  cards,
  catalog,
}: {
  label: string
  crowns: number
  cards: CardRef[]
  catalog: Record<number, CardInfo>
}) {
  const levels = cards.map((card) => card.level)
  const elixir = cards
    .map((card) => catalog[card.id]?.elixirCost ?? 0)
    .filter((cost) => cost > 0)

  const avgLevel = average(levels)
  const avgElixir = average(elixir)

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-[12px] font-medium text-ink">{label}</span>
        <span className="nums flex items-center gap-0.5 text-[12px] text-gold">
          <Crown size={11} strokeWidth={2.5} aria-hidden="true" />
          {crowns}
        </span>
      </div>

      <div className="mx-auto grid w-full max-w-[210px] grid-cols-4 gap-0 sm:max-w-none">
        {cards.map((card, index) => (
          <CardTile
            key={`${card.id}-${index}`}
            card={card}
            info={catalog[card.id]}
          />
        ))}
      </div>

      <div className="nums mt-1.5 flex items-center gap-2 text-[10px] text-dim">
        <span>ур. {avgLevel == null ? '—' : formatDecimal(avgLevel)}</span>
        <span className="flex items-center gap-0.5 text-elixir">
          <Droplet size={9} strokeWidth={2.5} aria-hidden="true" />
          {avgElixir == null ? '—' : formatDecimal(avgElixir)}
        </span>
      </div>
    </div>
  )
}

export default function BattleTooltip({ point, catalog }: BattleTooltipProps) {
  if (!point?.battleInfo) return null

  const { player, enemy } = point.battleInfo
  const result = point.isWin ? 'Победа' : point.isLoss ? 'Поражение' : 'Ничья'
  const tone = point.isWin
    ? 'text-gold'
    : point.isLoss
      ? 'text-coral'
      : 'text-dim'

  return (
    <div className="w-[500px] max-w-[calc(100vw-7rem)] rounded-[4px] border border-line border-t-2 border-t-gold bg-arena-deep/97 p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-ink">
            против {enemy.nickname}
          </div>
          <div className="mt-0.5 text-[11px] text-faint">
            {formatBattleTime(point.battleTime)}
          </div>
        </div>
        <div className={cn('shrink-0 text-right', tone)}>
          <div className="font-display text-[11px] font-semibold">{result}</div>
          <div className="nums mt-0.5 text-[13px] font-semibold">
            {formatSigned(point.change)}
          </div>
          <div className="nums mt-0.5 text-[11px] text-dim">
            {formatNumber(point.y - point.change)}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-line-soft pt-2.5 sm:grid-cols-2">
        <Deck
          label="Вы"
          crowns={player.crowns}
          cards={player.cards}
          catalog={catalog}
        />
        <Deck
          label={enemy.nickname}
          crowns={enemy.crowns}
          cards={enemy.cards}
          catalog={catalog}
        />
      </div>
    </div>
  )
}
