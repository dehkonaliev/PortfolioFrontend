export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.035] blur-[120px]"
        style={{ backgroundColor: 'var(--accent)' }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-[0.025] blur-[100px]"
        style={{ backgroundColor: 'var(--accent)' }}
      />
    </div>
  )
}