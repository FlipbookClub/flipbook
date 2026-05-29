import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

const steps = [
  {
    number: "01",
    title: "Start a club like a group chat.",
    body: 'Tap "Create," name it, share one link. Anyone who taps it is in. No friction. No app-wrangling. Pick the book you\'ve all been meaning to read.',
  },
  {
    number: "02",
    title: "Open the book and read inside the app.",
    body: "Your moderator uploads the book as a PDF — private to your club. Long-press any paragraph. Drop a reaction. Watch the room reply.",
  },
  {
    number: "03",
    title: "Finish, together.",
    body: "A soft progress view shows where everyone is — close enough to feel together, never close enough to make you feel behind. When the room reaches the last page, the conversation stays for whoever shows up next.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative border-t border-line bg-pull px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <Eyebrow>How a Flipbook club works</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mt-6 max-w-3xl text-[clamp(34px,5vw,56px)] text-text">
            Three steps, then you're reading.
          </h2>
        </Reveal>

        <ol className="mt-20 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.number} delay={i * 0.1}>
              <div className="card card-interactive flex h-full flex-col p-7 md:p-8">
                <span className="font-brand inline-flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 text-[13px] font-semibold tracking-[0.04em] text-accent">
                  {s.number}
                </span>
                <h3 className="font-display mt-6 text-[clamp(22px,2.4vw,30px)] leading-tight text-text">
                  {s.title}
                </h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-text-muted md:text-[16px]">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
