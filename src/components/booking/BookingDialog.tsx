"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { AnimatePresence, motion } from "framer-motion";
import { CAL_LINK, CAL_NAMESPACE } from "@/lib/cal";
import { useTheme } from "@/components/theme/ThemeContext";
import { useBooking } from "./BookingDialogContext";

/**
 * Booking popup — our own floating card, not Cal's full-screen modal.
 *
 * Cal's built-in popup renders inside a shadow DOM we can't restyle from the
 * page, so it came through as a wide black takeover. Instead we render Cal's
 * *inline* calendar inside a card we fully control: a compact rounded panel,
 * a soft dimmed backdrop that lets the page show through, and a close button.
 * Constraining the card to a phone-ish width makes Cal fall back to its
 * stacked (mobile) layout, which is what reads as a real popup.
 */
export function BookingDialog() {
  const { isOpen, planName, close } = useBooking();
  const { theme } = useTheme();

  // Brand the Cal embed once. Safe to run on every mount; Cal de-dupes.
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal("ui", {
        cssVarsPerTheme: {
          light: { "cal-brand": "#3c866b" },
          dark: { "cal-brand": "#c9f24e" },
        },
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  // Close on Escape and lock body scroll while the dialog is open.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [isOpen, close]);

  const config: Record<string, unknown> = { layout: "month_view", theme };
  if (planName) config.metadata = { plan: planName };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Soft dimmed backdrop — the page stays visible behind it. */}
          <button
            type="button"
            aria-label="Close booking"
            onClick={close}
            className="absolute inset-0 bg-night/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book a meeting"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative flex max-h-[88vh] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl border border-white/15 bg-background shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-pine/10 px-5 py-3.5 dark:border-white/10">
              <span className="text-sm font-semibold text-pine dark:text-white">
                Book a meeting
              </span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-pine/5 hover:text-pine dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <Cal
                namespace={CAL_NAMESPACE}
                calLink={CAL_LINK}
                config={config as never}
                style={{ width: "100%", height: "100%", minHeight: 520 }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
