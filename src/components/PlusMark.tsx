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
  const textColor = variant === "light" ? "text-white" : "text-pine dark:text-white";
  return (
    <span className={`inline-flex items-center font-script text-4xl leading-none ${textColor} ${className}`}>
      Sublime
      <PlusMark className="ml-0.5 h-4 w-4 self-start" strokeWidth={3.5} />
    </span>
  );
}
