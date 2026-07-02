export function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FF4500" />
      <ellipse cx="12" cy="13.5" rx="7" ry="6" fill="#FFFFFF" />
      <circle cx="18" cy="10.5" r="1.6" fill="#FFFFFF" />
      <circle cx="9" cy="13" r="1.3" fill="#FF4500" />
      <circle cx="15" cy="13" r="1.3" fill="#FF4500" />
      <path
        d="M8.7 16c1 .9 5.6 .9 6.6 0"
        stroke="#FF4500"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M12 9.5V6" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="5" r="1.4" fill="#FFFFFF" />
    </svg>
  );
}
