import { CreatorForm } from "@/components/CreatorForm";
import { Reveal } from "@/components/Reveal";

export function CreatorCard() {
  return (
    <section
      id="creators"
      className="relative border-t border-line px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-16 md:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div>
              <p className="eyebrow">For creators</p>
              <h2 className="display mt-6 text-[clamp(32px,4.5vw,52px)] leading-[1.05] text-text">
                Writing something serial?
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <p className="text-[17px] leading-[1.7] text-text-muted md:text-[18px]">
                Indie authors and serialized novelists get a private creator beta.
                Publish chapters to your readers, not to a feed. Keep the
                relationship. Keep the room.
              </p>
              <CreatorForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
