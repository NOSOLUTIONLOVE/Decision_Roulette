export function WheelHub() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-12 w-12 lg:h-16 lg:w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, var(--color-paper-50) 0%, var(--color-paper-100) 60%, var(--color-paper-200) 100%)',
        border: '2px solid var(--color-brand-500)',
        boxShadow:
          '0 2px 6px rgba(40,38,27,0.15), 0 4px 12px rgba(40,38,27,0.1), inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(40,38,27,0.06)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: '18px',
          color: 'var(--color-brand-500)',
          lineHeight: 1,
          textShadow: '0 1px 1px rgba(255,255,255,0.5)',
        }}
        aria-hidden="true"
      >
        &#10087;
      </span>
    </div>
  );
}
