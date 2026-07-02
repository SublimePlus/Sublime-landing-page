import { PlusMark } from "../PlusMark";
import { Reveal } from "../Reveal";
import { BookMeetingButton } from "../booking/BookMeetingButton";

export function FinalCta() {
  return (
    <section id="contact" className="relative overflow-hidden bg-pine py-28 text-white">
      <PlusTexture />
      <Reveal className="relative mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready for content that runs itself?
        </h2>
        <p className="mt-4 text-white/70">
          Book a free 20-minute consult. We&apos;ll look at your current
          content and tell you exactly what we&apos;d change.
        </p>
        <BookMeetingButton className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-8 py-3.5 font-semibold text-pine transition-transform hover:scale-[1.03]">
          Book a free consult
          <PlusMark className="h-4 w-4" strokeWidth={3} />
        </BookMeetingButton>
      </Reveal>
    </section>
  );
}

function PlusTexture() {
  const marks = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true">
      {marks.map((_, i) => (
        <span
          key={i}
          className="absolute text-3xl font-bold text-lime"
          style={{
            top: `${(i * 41) % 100}%`,
            left: `${(i * 29) % 100}%`,
            transform: `rotate(${(i * 23) % 45}deg)`,
          }}
        >
          +
        </span>
      ))}
    </div>
  );
}
