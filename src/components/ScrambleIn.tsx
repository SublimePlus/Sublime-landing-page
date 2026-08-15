"use client";

import { useState, useEffect, useRef } from "react";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface ScrambleInProps {
  text: string;
  delay?: number;
  triggered?: boolean;
  className?: string;
}

export function ScrambleIn({
  text,
  delay = 0,
  triggered = true,
  className,
}: ScrambleInProps) {
  const [display, setDisplay] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!triggered || started.current) return;
    const timer = setTimeout(() => {
      started.current = true;
      let cursor = 0;
      const interval = setInterval(() => {
        cursor += 0.5;
        const revealed = Math.floor(cursor);
        let result = "";
        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            result += " ";
          } else if (i < revealed) {
            result += text[i];
          } else if (i < revealed + 3) {
            result += randomChar();
          } else {
            result += " ";
          }
        }
        setDisplay(result);
        if (revealed >= text.length) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [triggered, text, delay]);

  if (!display) return <span className={className}>&nbsp;</span>;
  return <span className={className}>{display}</span>;
}
