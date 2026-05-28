import { Reveal } from "@/components/Reveal";

export function Problem() {
  return (
    <section id="problem" className="relative px-6 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="eyebrow">The honest part</p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mt-6 text-[clamp(34px,5vw,56px)] text-text">
            You joined the book club because you wanted to be a reader again.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-8 text-[17px] leading-[1.7] text-text-muted md:text-[18px]">
            The intention was real — so was everyone else's. But without anything
            keeping you honest, the reading slipped quietly, then completely. By
            review time, half the group hadn't finished. The discussion fell to
            whoever talked loudest. The spirit left the room before the book did.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
