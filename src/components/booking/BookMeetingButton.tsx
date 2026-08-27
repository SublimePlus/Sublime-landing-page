"use client";

import { useBooking } from "./BookingDialogContext";

/**
 * Opens the booking popup (our own floating card — see BookingDialog). When a
 * plan name is passed it rides along as booking metadata so the team can see
 * which package prompted the call.
 */
export function BookMeetingButton({
  planName,
  className,
  children,
}: {
  planName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useBooking();

  return (
    <button type="button" className={className} onClick={() => open(planName)}>
      {children}
    </button>
  );
}
