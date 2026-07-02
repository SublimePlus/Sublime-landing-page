"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { BookingModal } from "./BookingModal";

type BookingModalContextValue = {
  open: (planName?: string) => void;
  close: () => void;
};

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

export function BookingModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [planName, setPlanName] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState(0);

  const open = useCallback((plan?: string) => {
    setPlanName(plan);
    setSessionId((n) => n + 1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <BookingModalContext.Provider value={value}>
      {children}
      <BookingModal key={sessionId} isOpen={isOpen} planName={planName} onClose={close} />
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const ctx = useContext(BookingModalContext);
  if (!ctx) {
    throw new Error("useBookingModal must be used within a BookingModalProvider");
  }
  return ctx;
}
