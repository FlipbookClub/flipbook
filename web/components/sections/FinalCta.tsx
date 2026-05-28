import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";

export function FinalCta() {
  return (
    <section
      id="get-the-beta"
      className="relative border-t border-line px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="eyebrow coral-dot">Closed beta — opens soon</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mt-7 text-[clamp(40px,6.2vw,80px)] leading-[1.02] text-text">
            The room is forming.
            <br />
            <em>Pull up a chair.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-text-muted">
            Drop your email. We'll send one welcome note, one question we'd love
            you to answer, and an invite the day the beta opens.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <WaitlistForm variant="final" source="final-cta" qualifier />
        </Reveal>
      </div>
    </section>
  );
}
