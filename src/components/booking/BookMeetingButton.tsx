"use client";

import { useBookingModal } from "./BookingModalContext";

export function BookMeetingButton({
  planName,
  className,
  children,
}: {
  planName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useBookingModal();
  return (
    <button type="button" onClick={() => open(planName)} className={className}>
      {children}
    </button>
  );
}
