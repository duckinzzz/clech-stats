export default function Masthead() {
  return (
    <header className="border-b border-border pb-8 md:pb-12">
      {/* Top row: service name + status */}
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-text-muted">
          Clech Stats
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-text-muted border border-border rounded-full px-3 py-0.5">
          Beta
        </span>
      </div>

      {/* Poster headline */}
      <h1 className="font-serif text-5xl md:text-7xl lg:text-[100px] leading-[0.9] -tracking-[0.03em] text-text-primary mb-4 md:mb-6">
        <span className="block uppercase">Динамика</span>
        <span className="block italic font-normal">трофеев</span>
      </h1>

      {/* Explanatory text */}
      <p className="font-sans text-base md:text-lg text-text-secondary max-w-prose leading-relaxed">
        График изменения трофеев игроков клана{' '}
        <span className="font-mono text-sm uppercase tracking-[0.15em] text-text-muted">
          Clech
        </span>
        . Каждая точка — сыгранный бой. Наведите курсор для деталей.
      </p>
    </header>
  )
}
