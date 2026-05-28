import { Reveal } from "@/components/Reveal";

export function FounderNote() {
  return (
    <section
      id="founder-note"
      className="relative border-t border-line bg-pull px-6 py-28 md:px-10 md:py-40"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="font-brand text-[12px] uppercase tracking-[0.22em] text-text-muted">
            Moks — Designer, founder · Lagos
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <blockquote className="display mt-8 text-[clamp(26px,3.2vw,38px)] leading-[1.25] text-text">
            <span aria-hidden className="text-accent">
              &ldquo;
            </span>
            I&apos;ve been a product designer for five years and a member of more
            book clubs than I&apos;ve finished books. I abandoned every reading app
            on the market. Flipbook is the one I wished existed — I&apos;m building
            it from Lagos, in the open, all the way to launch.
            <span aria-hidden className="text-accent">
              &rdquo;
            </span>
          </blockquote>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[14px]">
            <FounderLink label="Follow the build" href="https://x.com/" />
            <FounderLink label="Instagram" href="https://instagram.com/" />
            <FounderLink label="LinkedIn" href="https://linkedin.com/" />
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
