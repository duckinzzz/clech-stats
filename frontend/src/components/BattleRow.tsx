import type { RecentBattle } from '@/types'
import {
  cn,
  formatBattleTime,
  formatNumber,
  formatRelativeTime,
  formatSigned,
} from '@/lib/utils'

interface BattleRowProps {
  battle: RecentBattle
}

export default function BattleRow({ battle }: BattleRowProps) {
  const win = battle.change > 0
  const loss = battle.change < 0

  return (
    <div className="flex gap-3 border-b border-line-soft py-2.5">
      <span
        className={cn(
          'w-[3px] shrink-0 rounded-full',
          win ? 'bg-gold' : loss ? 'bg-coral' : 'bg-faint',
        )}
        aria-hidden="true"
      />

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[13px] leading-tight text-ink">
            {battle.player}
          </div>
          <div className="nums mt-0.5 text-[11px] text-faint">
            {formatNumber(battle.before)} трофеев
          </div>
        </div>

        <div className="flex shrink-0 items-baseline gap-2.5">
          <span
            className={cn(
              'nums font-display text-[14px] font-semibold',
              win ? 'text-gold' : loss ? 'text-coral' : 'text-faint',
            )}
            title={formatBattleTime(battle.battle_time)}
          >
            {formatSigned(battle.change)}
          </span>
          <span className="w-10 text-right text-[11px] text-faint">
            {formatRelativeTime(battle.battle_time)}
          </span>
        </div>
      </div>
    </div>
  )
}
