import { CreatorForm } from "@/components/CreatorForm";
import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

export function CreatorCard() {
  return (
    <section
      id="creators"
      className="relative border-t border-line px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="card grid items-start gap-12 p-8 md:grid-cols-[1fr_1.1fr] md:gap-16 md:p-14">
            <div>
              <Eyebrow>For creators</Eyebrow>
              <h2 className="display mt-6 text-[clamp(32px,4.5vw,52px)] leading-[1.05] text-text">
                Writing something serial?
              </h2>
            </div>
            <div>
              <p className="text-[17px] leading-[1.7] text-text-muted md:text-[18px]">
                Indie authors and serialized novelists get a private creator beta.
                Publish chapters to your readers, not to a feed. Keep the
                relationship. Keep the room.
              </p>
              <CreatorForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
