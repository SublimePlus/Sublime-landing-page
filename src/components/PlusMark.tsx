import { AppIcon } from "./AppIcon";

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
    <span className={`inline-flex items-center gap-2 font-sans font-bold text-xl ${textColor} ${className}`}>
      <AppIcon size={28} />
      Sublime<span className="text-lime">+</span>
    </span>
  );
}
