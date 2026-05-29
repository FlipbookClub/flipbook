import { Eyebrow } from "@/components/Eyebrow";
import { Reveal } from "@/components/Reveal";

export function FounderNote() {
  return (
    <section
      id="founder-note"
      className="relative border-t border-line bg-pull px-6 py-32 md:px-10 md:py-48"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <Eyebrow>Moks — Designer, founder · Lagos</Eyebrow>
        </Reveal>
        <Reveal delay={0.1}>
          {/* Sans-serif, not the editorial display face — a founder talking
              plainly. Generous line-height + a hair of negative tracking keeps
              a long paragraph readable at size. */}
          <blockquote className="mt-10 text-[clamp(21px,2.5vw,30px)] font-normal leading-[1.6] tracking-[-0.005em] text-text">
            I&apos;ve been in enough book clubs to know they almost never work.
            People join with the best intentions and quietly fall off — because
            reading alone isn&apos;t fun, and no one&apos;s keeping anyone honest. I
            wanted to read a book with my closest friends and family. Not review it.
            Not discuss it once a month.{" "}
            <span className="text-accent">Actually read it — together, page by page.</span>{" "}
            I built Flipbook because that experience didn&apos;t exist yet. It&apos;s
            for my people. And maybe yours too.
          </blockquote>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[14px]">
            <FounderLink label="Follow the build" href="https://x.com/useflipbook" />
            <FounderLink label="Instagram" href="https://instagram.com/useflipbook" />
            <FounderLink
              label="LinkedIn"
              href="https://www.linkedin.com/company/useflipbook"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FounderLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-2 text-text-muted transition-colors hover:text-accent"
    >
      {label}
      <span
        aria-hidden
        className="inline-block translate-y-px transition-transform duration-300 group-hover:translate-x-0.5"
      >
        ↗
      </span>
    </a>
  );
}
