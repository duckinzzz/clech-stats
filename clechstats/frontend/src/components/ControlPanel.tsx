import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PlayerItem } from '@/types'

interface ControlPanelProps {
  players: PlayerItem[]
  selectedPlayer: string
  onPlayerChange: (name: string) => void
  isLoading: boolean
}

export default function ControlPanel({
  players,
  selectedPlayer,
  onPlayerChange,
  isLoading,
}: ControlPanelProps) {
  return (
    <div className="border-b border-border py-4 md:py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Player selector */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="player-select"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted shrink-0"
          >
            Игрок
          </label>
          <Select
            value={selectedPlayer}
            onValueChange={onPlayerChange}
            disabled={isLoading}
          >
            <SelectTrigger
              id="player-select"
              className="w-[220px] bg-bg-card border-border font-sans text-sm h-9"
            >
              <SelectValue placeholder="Выберите игрока" />
            </SelectTrigger>
            <SelectContent>
              {players.map((p) => (
                <SelectItem key={p.tag} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--color-win)' }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
              Победа
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--color-loss)' }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
              Поражение
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
