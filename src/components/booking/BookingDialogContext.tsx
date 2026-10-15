"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Booking dialog state, lifted to context so any CTA on the page can open the
 * same popup. `planName` rides along as Cal booking metadata so the team can
 * see which package prompted the call.
 */
type BookingContextValue = {
  isOpen: boolean;
  planName?: string;
  open: (planName?: string) => void;
  close: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [planName, setPlanName] = useState<string | undefined>(undefined);

  const open = useCallback((plan?: string) => {
    setPlanName(plan);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, planName, open, close }),
    [isOpen, planName, open, close]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within a BookingDialogProvider");
  }
  return ctx;
}
