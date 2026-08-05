import { useRef, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ChartPoint, CardInfo } from '@/types'
import BattleTooltip from './BattleTooltip'

/* ─── types ─── */

interface TrophyChartProps {
  points: ChartPoint[]
  catalog: Record<number, CardInfo>
}

/* ─── helpers ─── */

function yTicks(min: number, max: number): number[] {
  const pad = Math.max((max - min) * 0.1, 10)
  const lo = Math.floor((min - pad) / 10) * 10
  const hi = Math.ceil((max + pad) / 10) * 10
  const step = Math.ceil((hi - lo) / 5 / 10) * 10 || 10
  const ticks: number[] = []
  for (let v = lo; v <= hi; v += step) ticks.push(v)
  return ticks
}

function getDotColor(change: number): string {
  if (change > 0) return 'var(--color-win)'
  if (change < 0) return 'var(--color-loss)'
  return 'var(--color-text-muted)'
}

/* ─── custom dot (purely visual — no hover logic) ─── */

function renderDot(props: {
  cx?: number
  cy?: number
  payload?: ChartPoint
}) {
  const { cx, cy, payload } = props
  if (cx == null || cy == null || !payload) return null
  const color = getDotColor(payload.change)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke="var(--color-bg-card)"
      strokeWidth={1.5}
    />
  )
}

/* ─── tooltip renderer ─── */

function renderTooltipContent(
  tooltipProps: Record<string, unknown>,
  catalog: Record<number, CardInfo>,
) {
  const payload = tooltipProps.payload as unknown as
    | { payload: ChartPoint }[]
    | undefined
  if (!payload || payload.length === 0) return null
  const point = payload[0].payload
  if (!point?.battleInfo) return null
  return <BattleTooltip point={point} catalog={catalog} />
}

/* ─── component ─── */

export default function TrophyChart({ points, catalog }: TrophyChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  /* auto-scroll to latest battles on load */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [points])

  /* derived values */
  const ticks = useMemo(() => {
    if (points.length === 0) return []
    const yMin = Math.min(...points.map((p) => p.y))
    const yMax = Math.max(...points.map((p) => p.y))
    return yTicks(yMin, yMax)
  }, [points])

  const chartHeight = 400

  /*chart width: ensure each point has enough space */
  const chartWidth = useMemo(
    () => Math.max(points.length * 14, 600),
    [points.length],
  )

  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-bg-card border border-border rounded-lg">
        <span className="font-mono text-sm text-text-muted uppercase tracking-widest">
          Нет данных
        </span>
      </div>
    )
  }

  return (
    <div className="relative bg-bg-card border border-border rounded-lg">
      <div className="flex">
        {/* Fixed Y axis */}
        <div
          className="shrink-0 bg-bg-card border-r border-border flex flex-col justify-between py-6"
          style={{ width: 52, height: chartHeight }}
        >
          {[...ticks].reverse().map((tick) => (
            <div
              key={tick}
              className="font-mono text-[10px] text-text-muted text-right pr-2 tabular-nums leading-none"
            >
              {tick.toLocaleString()}
            </div>
          ))}
        </div>

        {/* Scrollable chart area */}
        <div ref={scrollRef} className="overflow-x-auto flex-1">
          <div style={{ width: chartWidth, minWidth: '100%' }}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart
                data={points}
                margin={{ top: 24, right: 24, bottom: 24, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="x"
                  tick={{
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 10,
                    fill: 'var(--color-text-muted)',
                  }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  label={{
                    value: 'Бой №',
                    position: 'insideBottomRight',
                    offset: -12,
                    style: {
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 10,
                      fill: 'var(--color-text-muted)',
                    },
                  }}
                />
                {/* Hidden YAxis — ticks rendered in fixed panel above */}
                <YAxis
                  hide
                  domain={[ticks[0], ticks[ticks.length - 1]]}
                  ticks={ticks}
                />
                <Tooltip
                  content={(props) =>
                    renderTooltipContent(
                      props as unknown as Record<string, unknown>,
                      catalog,
                    )
                  }
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="var(--color-text-muted)"
                  strokeWidth={1.5}
                  dot={renderDot}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
