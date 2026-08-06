export default function Footer() {
  return (
    <footer className="border-t border-border mt-12 pt-6 pb-10 text-center">
      <p className="font-mono text-[11px] text-text-muted tracking-[0.1em]">
        Clech Stats · Данные обновляются автоматически ·{' '}
        {new Date().getFullYear()}
      </p>
    </footer>
  )
}
