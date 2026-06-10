// Decorative social-proof avatars — overlapping initial circles that make the
// signup count feel like real people, not just a number. Purely presentational
// (the count text carries the actual information), so it's aria-hidden.
const AVATARS = [
  { initial: "A", color: "#e0654f" }, // coral
  { initial: "T", color: "#3b3a6d" }, // indigo
  { initial: "M", color: "#c79a3e" }, // gold
  { initial: "D", color: "#5d7a6e" }, // sage
  { initial: "K", color: "#5d3a5a" }, // plum
];

export function AvatarStack() {
  return (
    <div className="flex -space-x-2.5" aria-hidden>
      {AVATARS.map((a) => (
        <span
          key={a.initial}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-bg"
          style={{ backgroundColor: a.color }}
        >
          {a.initial}
        </span>
      ))}
    </div>
  );
}
