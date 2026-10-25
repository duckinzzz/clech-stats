import { useMemo, useRef, useEffect, useState } from 'react'
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
import { formatNumber, plural } from '@/lib/utils'
import BattleTooltip from './BattleTooltip'

interface TrophyChartProps {
  points: ChartPoint[]
  catalog: Record<number, CardInfo>
}

function yScale(points: ChartPoint[]): { domain: [number, number]; ticks: number[] } {
  const values = points.map((p) => p.y)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, 20)
  const step = Math.max(10, Math.ceil(span / 4 / 10) * 10)
  const low = Math.floor(min / step) * step
  const high = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let value = low; value <= high; value += step) ticks.push(value)
  return { domain: [low, high], ticks }
}

function dotColor(change: number): string {
  if (change > 0) return 'var(--color-gold)'
  if (change < 0) return 'var(--color-coral)'
  return 'var(--color-faint)'
}

function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export default function TrophyChart({ points, catalog }: TrophyChartProps) {
  const { ref, width } = useContainerWidth<HTMLDivElement>()
  const reducedMotion = usePrefersReducedMotion()

  const scale = useMemo(() => yScale(points), [points])
  // Below ~9px per battle the dots collide, so the line carries the shape.
  const showDots = points.length > 0 && width / points.length >= 9

  if (points.length === 0) return null

  return (
    <section
      aria-label={`График трофеев за ${points.length} ${plural(points.length, ['бой', 'боя', 'боёв'])}`}
      className="min-w-0"
    >
      <div className="flex items-baseline justify-between gap-4 pb-3">
        <h2 className="text-[13px] text-dim">
          Последние {points.length}{' '}
          {plural(points.length, ['бой', 'боя', 'боёв'])}
        </h2>
        <div className="flex items-center gap-4 text-[12px] text-dim">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
            победа
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-coral" aria-hidden="true" />
            поражение
          </span>
        </div>
      </div>

      <div
        ref={ref}
        className="h-[260px] border-y border-line sm:h-[340px] lg:h-[400px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            margin={{ top: 18, right: 14, bottom: 6, left: 0 }}
          >
            <CartesianGrid
              stroke="var(--color-line-soft)"
              strokeWidth={1}
              vertical={false}
            />
            <XAxis
              dataKey="x"
              tick={{
                fontFamily: 'Onest Variable, sans-serif',
                fontSize: 10,
                fill: 'var(--color-faint)',
              }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              tickMargin={8}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              domain={scale.domain}
              ticks={scale.ticks}
              width={46}
              tick={{
                fontFamily: 'Onest Variable, sans-serif',
                fontSize: 10,
                fill: 'var(--color-faint)',
              }}
              tickFormatter={(value: number) => formatNumber(value)}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />
            <Tooltip
              offset={14}
              allowEscapeViewBox={{ x: false, y: true }}
              cursor={{ stroke: 'var(--color-line)', strokeWidth: 1 }}
              content={(props) => (
                <BattleTooltip
                  point={
                    (
                      props.payload as unknown as
                        | { payload: ChartPoint }[]
                        | undefined
                    )?.[0]?.payload
                  }
                  catalog={catalog}
                />
              )}
            />
            <Line
              type="linear"
              dataKey="y"
              stroke="var(--color-track)"
              strokeWidth={1.75}
              dot={
                showDots
                  ? (props) => {
                      const { cx, cy, payload } = props as {
                        cx?: number
                        cy?: number
                        payload?: ChartPoint
                      }
                      if (cx == null || cy == null || !payload) return null
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3.2}
                          fill={dotColor(payload.change)}
                          stroke="var(--color-arena)"
                          strokeWidth={1.5}
                        />
                      )
                    }
                  : false
              }
              activeDot={{
                r: 6,
                fill: 'var(--color-ink)',
                stroke: 'var(--color-arena)',
                strokeWidth: 2,
              }}
              isAnimationActive={!reducedMotion}
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
