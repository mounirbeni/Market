export function Logo({ size = 36, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="triq-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5a8ef7" />
            <stop offset="55%" stopColor="#1f5fe0" />
            <stop offset="100%" stopColor="#103fa3" />
          </linearGradient>
        </defs>
        {/* نجمة زليجية ثمانية */}
        <path
          d="M24 1.5 30.6 8.1 39.9 8.1 39.9 17.4 46.5 24 39.9 30.6 39.9 39.9 30.6 39.9 24 46.5 17.4 39.9 8.1 39.9 8.1 30.6 1.5 24 8.1 17.4 8.1 8.1 17.4 8.1Z"
          fill="url(#triq-mark)"
        />
        {/* الطريق */}
        <path d="M17 33 L24 15 L31 33" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round" opacity="0.95" />
        <path d="M24 20.5v2.5M24 26v2.5M24 31v2" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.95" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className="text-[19px] font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            طريق
          </span>
          <span className="num mt-1 text-[8.5px] tracking-[0.42em] opacity-45">TRIQ</span>
        </span>
      )}
    </span>
  );
}
