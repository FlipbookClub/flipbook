// Footer is the editorial closing — three columns, bottom rule, italic
// tagline on the right. No nav menu — anchors in the same page.
const columns: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "The room",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Why Flipbook", href: "#pillars" },
      { label: "Three modes", href: "#three-modes" },
    ],
  },
  {
    title: "For people",
    links: [
      { label: "Reader beta", href: "#get-the-beta" },
      { label: "Creator list", href: "#creators" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Follow the build",
    links: [
      { label: "X / Twitter", href: "https://x.com/" },
      { label: "Instagram", href: "https://instagram.com/" },
      { label: "LinkedIn", href: "https://linkedin.com/" },
      { label: "hello@getflipbook.com", href: "mailto:hello@getflipbook.com" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line px-6 py-20 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="font-brand text-xl font-semibold text-text">Flipbook</p>
            <p className="mt-3 max-w-xs text-[14px] leading-[1.7] text-text-muted">
              Read together. Finish more. Talk on the page.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-brand text-[11px] font-semibold uppercase tracking-[0.18em] text-text-subtle">
                  {col.title}
                </p>
                <ul className="mt-5 space-y-3 text-[14px]">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-text-muted transition-colors hover:text-accent"
                        target={l.href.startsWith("http") ? "_blank" : undefined}
                        rel={l.href.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 text-[13px] text-text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Flipbook. Built in Lagos, in the open.</p>
          <p className="font-display italic text-text-muted">
            A quiet vote of confidence in the reader.
          </p>
        </div>
      </div>
    </footer>
  );
}
