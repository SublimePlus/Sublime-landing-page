"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getMonthGrid, isPastDay, isSameDay, TIME_SLOTS } from "@/lib/calendar";
import { PlusMark } from "../PlusMark";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BookingModal({
  isOpen,
  planName,
  onClose,
}: {
  isOpen: boolean;
  planName?: string;
  onClose: () => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const cells = getMonthGrid(cursor.year, cursor.month);
  const canGoPrevMonth =
    cursor.year > today.getFullYear() ||
    (cursor.year === today.getFullYear() && cursor.month > today.getMonth());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !email) return;
    setSubmitting(true);
    // No backend wired up yet — this simulates a request so the flow
    // can be reviewed end to end before a real API is connected.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-pine/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book a meeting"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-night"
          >
            <div className="flex items-center justify-between border-b border-pine/10 px-6 py-5 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal dark:text-lime">
                  Book a meeting
                </p>
                <h3 className="text-lg font-semibold text-pine dark:text-white">
                  {planName ? `Let's talk about the ${planName} plan` : "Pick a time that works"}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-pine/5 hover:text-pine dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <PlusMark className="h-4 w-4 rotate-45" strokeWidth={2.5} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              {submitted ? (
                <SuccessState email={email} date={selectedDate} time={selectedTime} onClose={onClose} />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={!canGoPrevMonth}
                        onClick={() =>
                          setCursor((c) => {
                            const m = c.month === 0 ? 11 : c.month - 1;
                            const y = c.month === 0 ? c.year - 1 : c.year;
                            return { year: y, month: m };
                          })
                        }
                        className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-pine/15 text-lg text-pine transition-colors hover:border-teal hover:bg-teal/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-pine/15 disabled:hover:bg-transparent dark:border-white/15 dark:text-white dark:hover:border-teal dark:hover:bg-teal/20 dark:disabled:hover:border-white/15"
                        aria-label="Previous month"
                      >
                        ‹
                      </button>
                      <p className="text-sm font-semibold text-pine dark:text-white">
                        {MONTH_LABELS[cursor.month]} {cursor.year}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setCursor((c) => {
                            const m = c.month === 11 ? 0 : c.month + 1;
                            const y = c.month === 11 ? c.year + 1 : c.year;
                            return { year: y, month: m };
                          })
                        }
                        className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-pine/15 text-lg text-pine transition-colors hover:border-teal hover:bg-teal/10 active:scale-95 dark:border-white/15 dark:text-white dark:hover:border-teal dark:hover:bg-teal/20"
                        aria-label="Next month"
                      >
                        ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {WEEKDAY_LABELS.map((d, i) => (
                        <span key={i} className="py-1 text-xs font-medium text-stone dark:text-white/50">
                          {d}
                        </span>
                      ))}
                      {cells.map((cell, i) => {
                        if (!cell) return <span key={i} />;
                        const disabled = isPastDay(cell.date);
                        const selected = selectedDate && isSameDay(selectedDate, cell.date);
                        return (
                          <button
                            type="button"
                            key={i}
                            disabled={disabled}
                            onClick={() => {
                              setSelectedDate(cell.date);
                              setSelectedTime(null);
                            }}
                            className={`aspect-square rounded-full text-sm font-medium transition-colors ${
                              selected
                                ? "bg-teal text-white"
                                : disabled
                                  ? "text-stone/30 dark:text-white/20"
                                  : "text-pine hover:bg-lime/30 dark:text-white/80 dark:hover:bg-lime/20"
                            }`}
                          >
                            {cell.date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-pine dark:text-white">Pick a time</p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            type="button"
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                              selectedTime === slot
                                ? "border-teal bg-teal text-white"
                                : "border-pine/15 text-pine hover:border-teal dark:border-white/15 dark:text-white"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div>
                      <label htmlFor="booking-email" className="mb-2 block text-sm font-semibold text-pine dark:text-white">
                        Your email
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full rounded-lg border border-pine/15 px-4 py-2.5 text-sm text-pine placeholder:text-stone/50 focus:border-teal focus:outline-none dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime || !email || submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-lime px-6 py-3 font-semibold text-pine transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {submitting ? "Submitting…" : "Confirm request"}
                    {!submitting && <PlusMark className="h-4 w-4" strokeWidth={3} />}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessState({
  email,
  date,
  time,
  onClose,
}: {
  email: string;
  date: Date | null;
  time: string | null;
  onClose: () => void;
}) {
  return (
    <div className="py-6 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white">
        <PlusMark className="h-6 w-6" strokeWidth={3} />
      </span>
      <h4 className="text-lg font-semibold text-pine dark:text-white">Request sent</h4>
      <p className="mx-auto mt-2 max-w-xs text-sm text-stone dark:text-white/70">
        We&apos;ll reach out to <span className="font-medium text-pine dark:text-white">{email}</span> to confirm{" "}
        {date?.toLocaleDateString("en-US", { month: "long", day: "numeric" })} at {time}.
      </p>
      <button
        onClick={onClose}
        className="mt-6 rounded-full border border-pine/15 px-6 py-2.5 text-sm font-semibold text-pine transition-colors hover:bg-pine/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10"
      >
        Close
      </button>
    </div>
  );
}
