export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="ambient-drift absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.07] blur-[120px] dark:opacity-[0.09]"
        style={{ backgroundColor: 'var(--accent)' }}
      />
      <div
        className="ambient-drift absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-[0.05] blur-[110px] dark:opacity-[0.08]"
        style={{ backgroundColor: '#8250df', animationDelay: '-8s' }}
      />
      <div
        className="ambient-drift absolute left-1/3 top-1/3 h-[420px] w-[420px] rounded-full opacity-[0.045] blur-[140px] dark:opacity-[0.07]"
        style={{ backgroundColor: '#39c5cf', animationDelay: '-14s' }}
      />
    </div>
  )
}