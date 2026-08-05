import { useRecentBattles } from '@/api/client'
import BattleRow from './BattleRow'

export default function RecentBattles() {
  const { data, isLoading } = useRecentBattles(10)
  const battles = data?.battles ?? []

  return (
    <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
          Последние бои
        </span>
        <span className="font-mono text-[10px] text-text-muted tabular-nums">
          {battles.length}
        </span>
      </div>

      {/* Battle list */}
      <div className="px-4">
        {isLoading ? (
          <div className="py-8 text-center">
            <span className="font-mono text-xs text-text-muted">
              Загрузка...
            </span>
          </div>
        ) : battles.length === 0 ? (
          <div className="py-8 text-center">
            <span className="font-mono text-xs text-text-muted uppercase tracking-widest">
              Нет данных
            </span>
          </div>
        ) : (
          battles.map((b, i) => (
            <BattleRow
              key={`${b.player}-${b.battle_time}-${i}`}
              battle={b}
            />
          ))
        )}
      </div>
    </div>
  )
}
