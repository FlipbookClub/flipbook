import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

// Goldsand-style comparison chart, in our register. The device: three bars,
// one clearly taller, that quantify the problem the page is about — how much of
// what we start we actually finish. Numbers are directional (the footnote says
// so), not a cited study; the point is the shape of the gap, not the decimals.
const bars: Array<{ label: string; value: number; tone: "muted" | "accent"; note?: string }> = [
  { label: "Reading alone", value: 26, tone: "muted" },
  { label: "A book club, no shared tools", value: 43, tone: "muted" },
  { label: "A Flipbook room", value: 81, tone: "accent", note: "what we're building" },
];

export function Comparison() {
  return (
    <section
      id="why-it-works"
      className="relative border-t border-line px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <div>
            <Reveal>
              <Eyebrow>The gap we exist to close</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="display mt-7 text-[clamp(34px,5vw,60px)] leading-[1.02] text-text">
                Most books we start,
                <br />
                we never finish.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-7 max-w-md text-[17px] leading-[1.7] text-text-muted md:text-[18px]">
                Not for lack of wanting to. Reading alone is quiet, and quiet is easy
                to abandon. A room of people a few pages ahead changes the math.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="card p-7 md:p-10">
              <p className="font-brand text-[11px] font-semibold uppercase tracking-[0.16em] text-text-subtle">
                Of the books we start, the share we finish
              </p>

              <ul className="mt-9 space-y-8">
                {bars.map((b, i) => (
                  <li key={b.label}>
                    <div className="mb-3 flex items-baseline justify-between gap-4">
                      <span
                        className={`text-[15px] ${
                          b.tone === "accent"
                            ? "font-semibold text-text"
                            : "text-text-muted"
                        }`}
                      >
                        {b.label}
                        {b.note && (
                          <span className="ml-2 align-middle text-[11px] uppercase tracking-[0.14em] text-accent">
                            {b.note}
                          </span>
                        )}
                      </span>
                      <span
                        className={`font-brand text-[15px] font-semibold tabular-nums ${
                          b.tone === "accent" ? "text-accent" : "text-text-muted"
                        }`}
                      >
                        {b.value}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-text/10">
                      <div
                        className={`bar-fill h-full rounded-full ${
                          b.tone === "accent" ? "bg-accent" : "bg-text/45"
                        }`}
                        style={{ width: `${b.value}%`, animationDelay: `${0.15 + i * 0.12}s` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-9 text-[12px] leading-[1.6] text-text-subtle">
                Directional, not a study — the shape of the gap Flipbook is built to
                close.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
