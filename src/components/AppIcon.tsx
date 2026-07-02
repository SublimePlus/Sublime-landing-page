export function AppIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="100" height="100" rx="22" fill="#3C866B" />
      <text
        x="42"
        y="70"
        fontSize="56"
        fontWeight="800"
        fontFamily="Poppins, Arial, Helvetica, sans-serif"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        S
      </text>
      <rect x="69" y="20" width="10" height="20" rx="3" fill="#FFFFFF" />
      <rect x="64" y="25" width="20" height="10" rx="3" fill="#FFFFFF" />
    </svg>
  );
}
