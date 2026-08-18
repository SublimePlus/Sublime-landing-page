"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import { CAL_NAMESPACE } from "@/lib/cal";

/**
 * Initialises the Cal.com popup once for the whole app. Every
 * `BookMeetingButton` carries `data-cal-*` attributes that Cal picks up to open
 * the booking modal; this just configures how that modal looks.
 *
 * `theme: "auto"` follows the visitor's light/dark preference so the booking
 * popup matches the site.
 */
export function CalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal("ui", {
        theme: "auto",
        cssVarsPerTheme: {
          light: { "cal-brand": "#3c866b" },
          dark: { "cal-brand": "#c9f24e" },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return <>{children}</>;
}
