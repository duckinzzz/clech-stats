import { useRecentBattles } from '@/api/client'
import BattleRow from './BattleRow'

export default function RecentBattles() {
  const { data, isLoading } = useRecentBattles(10)
  const battles = data?.battles ?? []

  return (
    <section aria-label="Последние бои">
      <div className="flex items-baseline justify-between pb-3">
        <h2 className="text-[13px] text-dim">Последние бои</h2>
        <span className="nums text-[11px] text-faint">{battles.length}</span>
      </div>

      <div className="border-t border-line">
        {isLoading ? (
          <p className="py-6 text-[13px] text-faint">Загрузка…</p>
        ) : battles.length === 0 ? (
          <p className="py-6 text-[13px] text-faint">Боёв пока нет</p>
        ) : (
          battles.map((battle, index) => (
            <BattleRow
              key={`${battle.player}-${battle.battle_time}-${index}`}
              battle={battle}
            />
          ))
        )}
      </div>
    </section>
  )
}
