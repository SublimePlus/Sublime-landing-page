export function AppIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="100" height="100" rx="26" fill="#3C866B" />
      <path
        d="M 66 30
           C 66 24, 61 20, 52 20
           C 43 20, 38 24, 38 30
           C 38 35, 42 38, 49 40
           L 56 42
           C 66 45, 71 50, 71 59
           C 71 70, 62 77, 49 77
           C 36 77, 28 70, 27 59"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M79 10 V28 M70 19 H88"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
