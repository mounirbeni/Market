export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="lg-triq" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5c765" />
            <stop offset="100%" stopColor="#c75b39" />
          </linearGradient>
        </defs>
        <path d="M24 2 L46 24 L24 46 L2 24 Z" fill="url(#lg-triq)" />
        <path d="M24 9 L39 24 L24 39 L9 24 Z" fill="none" stroke="#0b0f16" strokeWidth="2" opacity="0.55" />
        <path d="M15 28 L24 19 L33 28" fill="none" stroke="#0b0f16" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="33" r="2.6" fill="#0b0f16" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-black tracking-tight">طريق</span>
        <span className="num text-[9px] tracking-[0.35em] opacity-55">TRIQ</span>
      </span>
    </span>
  );
}
