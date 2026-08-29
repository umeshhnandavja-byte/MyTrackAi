export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <rect x="6" y="6" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" className="stroke-background opacity-30" />
      <path d="M10 17L14 21L23 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="stroke-background" />
    </svg>
  )
}