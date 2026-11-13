# Flipbook Design System — Glass update (v2)

Changes from Epics 4–7 in this project (ReadScreenGlass, MarginScreenGlass, CommunityScreenGlass, ChatScreenGlass), written to apply to the Flipbook Design System project. Colour, type and spacing tokens stay as they are; the material, shape, icons and motion rules change.

## 1. Rules this overrides in the current readme

| Current rule | Glass rule |
| --- | --- |
| "No blur effects." Transparency only for scrim and highlight fills. | Floating chrome is frosted glass: headers, segmented tabs, tab bar, toasts, sheets, composers, floating pills. Content (book text, cards in the flow) stays solid. |
| Buttons, cards and bubbles 12px; sheets 16px. | Controls are fully rounded pills. Cards 22–28px, bubbles 22px with an 8px tail corner, sheets 36px inset 8px from the screen edges. Covers stay 4px. |
| Cards: no border, no shadow. | Glass cards carry a 1px inner hairline and a 1px top highlight (see tokens). Still no left-accent stripes, no drop shadows on in-flow cards. |
| Icons: Lucide, 1.75 / 1.5 stroke. | Hugeicons stroke-rounded (free set), 1.5 stroke at every size. |
| Elevation via `surface-raised` only. | Floating glass elements add a soft float shadow (below). |

## 2. New tokens (add to colors.css, all three themes)

```css
--glass-fill:        color-mix(in oklab, var(--surface-raised) 70%, transparent);
--glass-fill-strong: color-mix(in oklab, var(--surface-raised) 82%, transparent);  /* menus, reaction bar */
--glass-chrome:      color-mix(in oklab, var(--surface) 72%, transparent);         /* header, composer, footers */
--glass-sheet:       color-mix(in oklab, var(--surface) 76%, transparent);
--glass-blur:        blur(24px) saturate(180%);
--glass-blur-sheet:  blur(36px) saturate(180%);
--glass-hairline:    inset 0 0 0 1px color-mix(in oklab, var(--text) 9%, transparent);
--glass-highlight:   inset 0 1px 0 rgba(255,255,255,.12);   /* .22 on floating pills, .25 on sheets */
--glass-float:       0 14px 30px -10px rgba(8,6,30,.5);
--glass-sheet-shadow:0 -10px 40px -10px rgba(8,6,30,.5);
--tint-1:            color-mix(in oklab, var(--text) 6%, transparent);   /* quiet fills, option rows */
--tint-2:            color-mix(in oklab, var(--text) 10%, transparent);  /* secondary pill buttons */
--tint-3:            color-mix(in oklab, var(--text) 12%, transparent);  /* active segment */
--selected-fill:     color-mix(in oklab, var(--focus-ring) 12%, transparent);
--selected-ring:     inset 0 0 0 1.5px var(--focus-ring);
--bubble-mine:       color-mix(in oklab, var(--primary) 24%, var(--surface));
--scrim-focus:       color-mix(in oklab, #121212 64%, transparent);  /* long-press focus, with blur(14px) */
```

Radius additions to spacing.css: `--radius-card-glass: 28px`, `--radius-bubble: 22px`, `--radius-bubble-tail: 8px`, `--radius-sheet-glass: 36px`, `--radius-row: 22px`.

## 3. Component changes

- **Button** — all variants become pills (`radius-full`). Primary 52px in footers and sheets, 48px inline, 40px in cards. Secondary = `--tint-2` fill, text colour. Primary still once per view.
- **Icon** — swap Lucide nodes for Hugeicons (`@hugeicons/core-free-icons`), keep existing names. Already done in this project's copy of `_ds_bundle.js`. Agreed glyphs: lock = `SquareLock02Icon`, bell = `Notification01Icon`, shelf = `Bookshelf02Icon`.
- **Banner** — inline: pill or 22px glass card with tinted icon disc. Toast: floating glass pill, 32px status disc on the left.
- **ChatMessage** — 22px bubbles with 8px tail; theirs = `--glass-fill` + hairline, mine = `--bubble-mine`. Meta line "Name · Ch N" above every bubble. Reactions overlap the bubble's bottom edge by 10px. Removed = transparent with a 1.5px ring and italic muted text. Quote card = Literata italic 16/24, source caption, "Open in the book" pill.
- **Veil** — `--veil` fill inside the bubble shape, icon (eye-off, mic, or book for quote cards) plus the standard copy.
- **VoiceNote** — 36px round play button, rounded waveform bars, duration and speed chip below. Recording bar: `--recording` tinted pill, 64px recording-colour mic with pulse halo (reduced-motion: static).
- **ReactionPicker** — solid `surface-raised` pill with float shadow when it sits over a scrim; glass otherwise.
- **MemberProgress** — 6px rounded rail, 26px avatar markers with a 2px surface ring; "You" marker ringed in `--progress-fill`.
- **SessionCard / LiveBar** — glass card; LiveBar is a floating glass pill.
- **New patterns to document** (built from existing parts, not new components unless you want them): segmented tabs (glass pill, active segment `--tint-3`), floating tab bar (glass pill, 64px, inset 16px), header with glass back button and grouped action pill, glass bottom sheet with grabber, option row (22px, `--selected-fill` + `--selected-ring` when chosen, radio on the right), community emblem (circle, initial fallback on a highlight fill), unread quiet dot (7px, `--text-accent`).

## 4. Motion

Unchanged durations. Added: recording pulse (1.4s ease-out loop) and the long-press focus scrim (blur 14px, 64%). Both respect reduced motion.

## 5. Decisions (confirmed 7 Oct 2026)

1. **Glass ships in all three themes** — Light, Flip and Dark.
2. **Two styles, side by side.** Keep the current flat style (12px buttons/cards/bubbles, 16px sheets, solid `surface-raised`) as **Classic**, and add **Glass** (pills, 22–36px, frosted chrome). Implement as a `data-style="classic" | "glass"` attribute alongside `data-theme`, with style-scoped tokens (`--radius-button`, `--radius-card`, `--radius-bubble`, `--radius-sheet`, `--chrome-fill`, `--chrome-blur`, `--card-fill`, `--card-ring`). Every component reads those tokens and accepts an optional `look="classic" | "glass"` prop that overrides the ancestor. Default: Glass.
3. **Drop "No blur effects".** Replace with: blur is for floating chrome only (headers, tabs, tab bar, toasts, sheets, composer, floating pills) and the long-press focus scrim; never on content or in-flow cards.
4. **The patterns become real components:** `SegmentedTabs`, `TabBar`, `Sheet`, `OptionRow`, `Emblem`, `AppHeader`, `Composer`, `Toast` (split from Banner), `UnreadDot`. Each gets `.jsx`, `.d.ts`, `.prompt.md` and a card showing Classic and Glass in all three themes.
