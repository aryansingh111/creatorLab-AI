export const LogoMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#1D4ED8"/><path d="M13 44 L26 31 L34 38 L47 21" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/><path d="M47 8 L50 16 L58 19 L50 22 L47 30 L44 22 L36 19 L44 16 Z" fill="#F5C451"/></svg>
);

export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className="text-lg font-bold tracking-tight text-navy">Creator<span className="text-brand">Lab</span></span>
        <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">AI</span>
      </span>
    </span>
  );
}
