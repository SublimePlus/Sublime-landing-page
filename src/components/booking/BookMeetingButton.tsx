"use client";

import { CAL_LINK, CAL_NAMESPACE } from "@/lib/cal";

/**
 * Opens the Cal.com booking popup. The `data-cal-*` attributes are what Cal's
 * embed listens for; `CalProvider` has already initialised the popup. When a
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
  const config: Record<string, unknown> = { layout: "month_view" };
  if (planName) config.metadata = { plan: planName };

  return (
    <button
      type="button"
      className={className}
      data-cal-namespace={CAL_NAMESPACE}
      data-cal-link={CAL_LINK}
      data-cal-config={JSON.stringify(config)}
    >
      {children}
    </button>
  );
}
