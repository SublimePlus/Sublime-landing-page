export function PlusMark({
  className,
  strokeWidth = 2.5,
  style,
}: {
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const textColor = variant === "light" ? "text-white" : "text-pine";
  return (
    <span className={`inline-flex items-center gap-1 font-sans font-bold text-xl ${textColor} ${className}`}>
      Sublime
      <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-lime text-pine">
        <PlusMark className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </span>
  );
}
