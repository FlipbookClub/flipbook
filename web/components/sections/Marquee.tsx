// CSS-only marquee strip. Tone-setter — no functional load. Duplicated
// content for seamless wrap. Respects prefers-reduced-motion via the
// `.marquee-track` rule in globals.css.
const phrases = [
  "Reading is a verb.",
  "The book is the room.",
  "Finish more of what you start.",
  "Reactions live next to the paragraph.",
  "No streaks. No shame. No leaderboards.",
  "Built in the open from Lagos.",
  "Three modes. One library.",
];

export function Marquee() {
  const sequence = [...phrases, ...phrases];
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-line bg-pull py-5"
    >
      <div className="marquee-track gap-12">
        {sequence.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="font-display whitespace-nowrap text-[22px] leading-none text-text-muted"
          >
            {p}
            <span className="mx-12 text-accent">·</span>
          </span>
        ))}
      </div>
    </section>
  );
}
