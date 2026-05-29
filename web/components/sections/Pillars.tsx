import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

const pillars = [
  {
    number: "01",
    title: "Finish more",
    body: [
      "Reading alongside other people — visibly, gently — is the difference between a book finished and a bookmark abandoned.",
      "No streaks. No nudges that shame you. The room is just ahead of you, and that turns out to be enough.",
    ],
  },
  {
    number: "02",
    title: "Talk on the page",
    body: [
      "Every reaction, every reply lives next to the paragraph that prompted it.",
      "No spoilers ahead. No ghost-town Discord. The conversation is right where you are in the book — and only what's safe to see from where you've read.",
    ],
  },
  {
    number: "03",
    title: "Follow the writers",
    body: [
      "Indie authors publish here and turn their readers into a room, not a mailing list.",
      <>
        When a writer drops a chapter, you get a notification that actually means
        something: <em className="font-display text-text">the room is open.</em>
      </>,
    ],
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="relative border-t border-line px-6 py-32 md:px-10 md:py-48">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 md:grid-cols-[1fr_2fr] md:gap-16">
          <Reveal>
            <div className="md:sticky md:top-32">
              <Eyebrow>Why Flipbook</Eyebrow>
              <h2 className="display mt-6 text-[clamp(32px,4.5vw,52px)] leading-[1.05] text-text">
                Reading, the way it used to feel.
              </h2>
            </div>
          </Reveal>

          <ul className="mt-12 space-y-5 md:mt-0">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.number} delay={i * 0.05}>
                <div className="card card-interactive grid grid-cols-[auto_1fr] gap-6 p-7 md:gap-8 md:p-9">
                  <span className="font-brand text-[13px] font-semibold tracking-[0.18em] text-accent">
                    {p.number}
                  </span>
                  <div>
                    <h3 className="font-display text-[clamp(26px,3vw,38px)] leading-tight text-text">
                      {p.title}
                    </h3>
                    <div className="mt-5 space-y-4 text-[16px] leading-[1.7] text-text-muted md:text-[17px]">
                      {p.body.map((b, j) => (
                        <p key={j}>{b}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
