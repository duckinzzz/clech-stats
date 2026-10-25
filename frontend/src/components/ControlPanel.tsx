import type { PlayerItem, PlayerOverview } from '@/types'
import { cn, formatNumber, formatSigned, plural } from '@/lib/utils'

interface ControlPanelProps {
  players: PlayerItem[]
  overview: PlayerOverview[]
  selectedPlayer: string
  onPlayerChange: (name: string) => void
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="nums text-[11px] text-faint">0</span>
  return (
    <span
      className={cn(
        'nums text-[11px]',
        value > 0 ? 'text-gold' : 'text-coral',
      )}
    >
      {formatSigned(value)}
    </span>
  )
}

export default function ControlPanel({
  players,
  overview,
  selectedPlayer,
  onPlayerChange,
}: ControlPanelProps) {
  const byName = new Map(overview.map((p) => [p.name, p]))

  return (
    <section aria-label="Игроки клана" className="border-b border-line">
      <div className="flex items-baseline justify-between gap-4 py-3 text-[12px] text-faint">
        <span>Ростер клана</span>
        <span className="hidden sm:inline">
          Изменение трофеев за 10 последних записанных боёв
        </span>
      </div>

      <div
        className="rail -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0"
        role="group"
        aria-label="Выбор игрока"
      >
        {players.map((player) => {
          const info = byName.get(player.name)
          const isActive = player.name === selectedPlayer
          return (
            <button
              key={player.tag}
              type="button"
              aria-pressed={isActive}
              onClick={() => onPlayerChange(player.name)}
              title={
                info
                  ? `${player.name}: ${formatSigned(info.delta)} за ${info.battles} ${plural(info.battles, ['бой', 'боя', 'боёв'])}`
                  : player.name
              }
              className={cn(
                'relative shrink-0 border-t-2 px-3.5 pt-2.5 pb-3 text-left transition-colors',
                isActive
                  ? 'border-gold bg-deck'
                  : 'border-transparent hover:bg-deck/60',
              )}
            >
              <span
                className={cn(
                  'block max-w-[9rem] truncate text-[13px] leading-tight',
                  isActive ? 'text-ink' : 'text-dim',
                )}
              >
                {player.name}
              </span>
              <span className="mt-1.5 flex items-baseline gap-2">
                <span
                  className={cn(
                    'nums font-display text-[17px] leading-none font-semibold',
                    isActive ? 'text-gold' : 'text-ink',
                  )}
                >
                  {info?.trophies != null ? formatNumber(info.trophies) : '—'}
                </span>
                {info && <Delta value={info.delta} />}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
