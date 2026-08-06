import type { RecentBattle } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface BattleRowProps {
  battle: RecentBattle
}

export default function BattleRow({ battle }: BattleRowProps) {
  const changeSign = battle.change > 0 ? '+' : ''
  const pillBg =
    battle.change > 0
      ? 'rgba(74,124,89,0.12)'
      : battle.change < 0
        ? 'rgba(196,92,92,0.12)'
        : 'rgba(138,138,138,0.10)'
  const pillText =
    battle.change > 0
      ? 'var(--color-win)'
      : battle.change < 0
        ? 'var(--color-loss)'
        : 'var(--color-text-muted)'

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
      {/* Left: player name + trophies before */}
      <div className="min-w-0 flex-1">
        <div className="text-sm text-text-primary truncate font-sans">
          {battle.player}
        </div>
        <div className="font-mono text-[11px] text-text-muted tabular-nums mt-0.5">
          {battle.before.toLocaleString()} 🏆
        </div>
      </div>

      {/* Right: change pill + time */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="inline-flex items-center font-mono text-xs tabular-nums font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: pillBg, color: pillText }}
        >
          {changeSign}
          {battle.change}
        </span>
        <span className="font-mono text-[10px] text-text-muted tabular-nums w-8 text-right">
          {formatRelativeTime(battle.battle_time)}
        </span>
      </div>
    </div>
  )
}
