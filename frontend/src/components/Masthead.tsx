import { Trophy } from 'lucide-react'
import type { PlayerSummary } from '@/types'
import { formatNumber, formatSigned, plural } from '@/lib/utils'

interface MastheadProps {
  playerName: string
  summary: PlayerSummary | null
}

export default function Masthead({ playerName, summary }: MastheadProps) {
  const deltaTone =
    !summary || summary.delta === 0
      ? 'text-dim'
      : summary.delta > 0
        ? 'text-gold'
        : 'text-coral'

  return (
    <header className="border-b-2 border-line pt-9 pb-7 md:pt-12 md:pb-9">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.25rem,6.4vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.035em] text-ink">
            Динамика
            <span className="block font-light text-dim">трофеев</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-dim">
            Каждая точка на графике это сыгранный бой. Наведите на точку,
            чтобы увидеть колоды и счёт по коронам.
          </p>
        </div>

        {summary && (
          <div className="shrink-0 md:text-right">
            <div className="text-[13px] text-dim">
              <span className="font-medium text-ink">{playerName}</span> за{' '}
              {summary.battles}{' '}
              {plural(summary.battles, ['бой', 'боя', 'боёв'])}
            </div>
            <div
              className={`nums mt-1 font-display text-[clamp(2.25rem,5.6vw,3.6rem)] leading-none font-semibold ${deltaTone}`}
            >
              {formatSigned(summary.delta)}
            </div>
            <div className="nums mt-2 flex items-baseline gap-1.5 text-[13px] text-dim md:justify-end">
              <Trophy
                size={13}
                strokeWidth={2.25}
                className="translate-y-[1px] text-gold"
                aria-hidden="true"
              />
              <span className="text-ink">
                {formatNumber(summary.current)}{' '}
                {plural(summary.current, ['трофей', 'трофея', 'трофеев'])},{' '}
                {summary.wins}{' '}
                {plural(summary.wins, ['победа', 'победы', 'побед'])}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
