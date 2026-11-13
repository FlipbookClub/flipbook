# Flipbook Design System

Flipbook is a mobile reading app for iOS and Android where people read the same book together. Friends' reactions sit in the margin beside the paragraph that provoked them, revealed only as you reach it. Around each book is a community: a Lobby, a chat and live audio sessions. Kindle is where you read; Flipbook is where you read together.

The feeling to design for: a candle-lit reading nook with good company. You finish a chapter and it feels like you just talked about it with someone you like.

**Product surfaces:** one product, the Flipbook mobile app (iOS + Android). Key areas: Home (shelves), book page, the Reader (with the margin), the community Lobby, Chat, and live audio Sessions.

## Sources

Built from `flipbook-design-system.zip` (expanded at `uploads/flipbook-design-system/`):
- `README.md` — the brand book (principles, content, visual foundations, iconography).
- `tokens.json` — colours (3 themes), type, spacing, radius, shadow, duration, size. Copied to `tokens/tokens.json`.
- `figma-tokens/` — Figma variable exports (Brand, Light, Dark, Flipbook). Copied to `tokens/figma-tokens/`.
- `components/*/README.md` + `preview.html` — spec and HTML preview per component; `components/Cover/preview.html` is the brand cover artwork.

No Figma link or codebase was provided.

## Principles

When two principles conflict, the higher one wins.
1. **The margin is the product.** Social surfaces support reading; they never compete with it.
2. **Spoilers are sacred.** Anything tied to a place in the book has a veiled state.
3. **Reading first, chrome second.** Inside the reader the interface recedes.
4. **Warm, not loud.** No leaderboards, star ratings as primary UI, red count badges, infinite feeds, shame or urgency.
5. **Daily return, not session length.** A missed day is never framed as failure.
6. **Built for real conditions.** Mid-range Android, patchy 4G, expensive data. Every screen looks right loading and offline.
7. **One brand, three rooms.** Every component works in Light, Flip and Dark. Flip is the signature.

## Content fundamentals

- **Voice:** warm, generous, lightly clever. Never cute. Address the reader as "you"; the product never says "we".
- **Casing:** sentence case everywhere — buttons, titles, tabs ("Read together", "Friends are reading").
- **Punctuation:** no exclamation marks.
- **Emoji:** never in UI copy. Emoji appear only as reactions people send (♥ 😂 😮 😢 🔥 🤔).
- **Banned word:** "platform".
- **Positions:** chapter and percentage ("Ch 7", "62%"). Never page numbers in social UI.
- **Errors:** calm and specific, with the next step: "Your bank didn't approve this one." · Try again.
- **Empty states invite:** "Read this with someone."
- **Spoiler veils** state the fact and give the choice: "Ada is in Chapter 9. Tap to reveal."
- **Privacy:** never reveal who hasn't bought a book; a member without a position is "Not started".
- **Prices:** naira sign, no space: "₦1,500". Pro books say "Included with Pro", never "₦0".
- **Button labels:** verb first; a price belongs in the label when it is the action: "Get it ₦1,500".
- **Kind nudges:** "You're in Chapter 6. Four chapters to go before Saturday."
- Test copy keeps the naira sign and Yoruba / Igbo diacritics (Ọlá, Ụ̀kpụrụ).
- Headline and tagline lines are owned by the brand lead. Current positioning line: "Kindle is where you read. Flipbook is where you read together."

## Visual foundations

**Colour.** Use semantic tokens only; brand scales (`--indigo-*`, `--coral-*`, `--neutral-*`, `--gold-*`, `--green-*`, `--orange-*`, `--aqua*`, `--plum`, `--ivory`, `--pale-sky`, `--black`) exist to be aliased. Three themes via `data-theme` on any element: **Light** (default, white `surface`, indigo text, indigo primary, coral secondary), **Flip** (signature: indigo-900 ground, ivory/white text, coral-400 primary, gold accents), **Dark** (near-black #121212, indigo-600 primary, aqua secondary). Primary appears at most once per view. Errors/warnings/confirmations always sit in a tinted container with an icon — never coral alone, because coral is the brand. The reader in Light sits on Warm Ivory (#f7f3e3), not white. Five highlight fills (sand, aqua, rose, mint, lavender) keep `reader-text` readable in every theme.

**Type.** Manrope for all interface text; Literata (with optical sizes and italics) for book text and passage quotes. Interface steps: display 32/40 700 (once per screen), h1 24/32 700, h2 20/28 600, h3 17/24 600, body 15/22 400, label 13/18 600, caption 12/16 500. Reader: reading 18/30, reading-chapter 24/32 600, quote 16/24 italic. Utility classes `.t-<step>` exist in `tokens/typography.css`.

**Spacing.** 4px grid, `space-1`…`space-12` (4, 8, 12, 16, 20, 24, 32, 40, 48). Screen side margin `space-5` (20). Card padding `space-4` (16). Between sections `space-6` (24). Sheet top padding `space-10`.

**Two styles: Glass and Classic.** Set `data-style="glass" | "classic"` on any element, alongside `data-theme`; Glass is the default and ships in Light, Flip and Dark. Components read only the style-scoped tokens in `tokens/glass.css` (`--radius-button`, `--radius-card`, `--radius-bubble-main`/`-corner`, `--radius-sheet`, `--chrome-fill`, `--chrome-blur`, `--card-fill`, `--card-ring`, `--float-*`, `--sheet-*`, `--button-secondary*` …) and every component takes an optional `look="classic" | "glass"` prop that overrides the ancestor. Colour, type and spacing tokens are shared.

**Corners.** Covers stay nearly square in both styles: `radius-cover` 4px with a `divider` hairline. Chips, inputs and highlights 8px. *Glass:* controls are fully rounded pills; cards 22–28px (`--radius-card-glass` 28); bubbles 22px with an 8px tail corner; option rows and inline banners 22px (`--radius-row`); sheets 36px inset 8px from the screen edges. *Classic:* buttons, cards and bubbles 12px; sheets and dialogs 16px. Avatars and badges full in both.

**Cards.** 16px padding. *Glass:* `--glass-fill` with a 1px inner hairline (`--glass-hairline`) and 1px top highlight (`--glass-highlight`), no blur, no drop shadow. *Classic:* flat `surface-raised`, no border, no shadow. Never left-accent stripes.

**Elevation.** In-flow content never casts a shadow. *Glass:* floating glass (toasts, live bar, tab bar, reaction bar) adds `--glass-float` (0 14px 30px -10px); sheets `--glass-sheet-shadow`. *Classic:* flat; separate with `surface-raised`; only sheets (`--shadow-sheet`) and floating bars (`--shadow-float`) cast shadows.

**Backgrounds.** Solid grounds only. No gradients, no textures, no photography in UI chrome. Brand artwork (the cover) is flat rounded colour blocks with a quarter-circle "page corner" pattern — sides on `space-4` multiples, `radius-md` corners. Never stock photos of someone reading by a window, never AI-generated illustration.

**Imagery.** Book covers are the only imagery; they carry their own colour. Placeholders are flat typeset blocks.

**Transparency & blur.** Blur is for floating chrome only — headers, segmented tabs, tab bar, toasts, sheets, composer, floating pills — and the long-press focus scrim (`--scrim-focus` 64% with `--scrim-focus-blur` 14px). Never on book text or in-flow cards. Glass fills: `--glass-chrome` (surface 72%: header, composer, footers, tab bar), `--glass-fill` (surface-raised 70%: floating pills, toasts, theirs bubbles), `--glass-fill-strong` (82%: menus, reaction bar), `--glass-sheet` (surface 76%), blurred with `--glass-blur` (24px, saturate 180%) or `--glass-blur-sheet` (36px). Quiet fills use `--tint-1/2/3` (text at 6/10/12%); selection uses `--selected-fill` + `--selected-ring`. Also: the `scrim` behind sheets and highlight fills on Flip/Dark (~30% alpha). Classic uses no blur.

**Motion.** Quiet. Fades and slides at `duration-base` 200ms ease-out; press states at `duration-fast` 150ms. Only five moments animate at `duration-slow` 250ms: sending a reaction, a reaction arriving, recording a voice note, going live, finishing a book. Two loops: the recording pulse (1.4s ease-out halo behind the mic) and the long-press focus scrim fade. Every animation has a reduced-motion version (the pulse becomes static); a new reaction never moves the text. No bounces.

**States.** Hover (web only) shifts to the `-hover` step of the same hue; pressed uses the `-pressed` step (darker in Light, varies in Flip/Dark); disabled uses `-disabled` tokens — not opacity. Focus is a solid 2px `focus-ring` with a 2px gap. Loading keeps the pressed fill with three dots and a verb ("Opening"). Every component has skeleton (`skeleton` + `skeleton-shimmer`), empty, error and offline states.

**Layout.** Mobile-first; main action in the lower third. Touch targets ≥ 44px; buttons 48px inline, 52px (`size="lg"`) in footers and sheets, 40px in cards. Glass tab bar: 64px pill inset 16px. Floating live bar sits above the tab bar. Shelves scroll sideways; never endless grids. Inside the reader, chrome appears on request and leaves quickly.

## Iconography

- **Hugeicons** stroke-rounded, free set (`@hugeicons/core-free-icons`, MIT): `icon-md` 24px and `icon-sm` 20px, 1.5 stroke at every size. Icons take the colour of the text beside them. Agreed glyphs: lock = `SquareLock02Icon`, bell = `Notification01Icon`, shelf = `Bookshelf02Icon`.
- Pair icons with words unless universal (play, close, back).
- Animated icons are rebuilt natively, each with a static fallback.
- The `Icon` component embeds Hugeicons node data for the ~33 glyphs used here under Flipbook names; `Icon.sources` maps each to its Hugeicons export. Production: `@hugeicons/react` `HugeiconsIcon` with `strokeWidth={1.5}`.
- No emoji as icons; no unicode glyph icons. Emoji only as user reactions; ♥ is the first reaction.
- **Logo:** SVGs in `assets/logo/`. Full lockup: `flipbook-full-{light|flip|dark}-colored.svg`, `flipbook-full-{light|dark}-mono.svg`. Icon mark: `flipbook-icon-{light|flip}-{primary|alternate|mono}.svg`. Match the file to the theme ground (Flip files on the indigo Flip surface). Use the full lockup for headers and splash; the icon for app icons, avatars and tight spaces. Never redraw or recolour the mark. Cards: `guidelines/brand-wordmark.html`, `guidelines/brand-icon.html`.

## Never

Stock photos of readers by windows or AI illustration · avatar grids or star ratings as primary UI · red notification counts, crowded screens, decorative gradients · showing who hasn't bought a book or ordering readers by progress.

## Index

- `styles.css` — global entry; `@import`s only.
- `tokens/` — `fonts.css` (Google Fonts), `colors.css` (brand scales + Light/Flip/Dark semantics + shadows), `typography.css`, `spacing.css` (space, radius, size, duration), `glass.css` (glass materials + Classic/Glass style tokens), `base.css`; source `tokens.json` and `figma-tokens/`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand).
- `assets/logo/` — full and icon logo SVGs for Light, Flip and Dark.
- `components/` — React primitives, one directory each with `.jsx`, `.d.ts`, `.prompt.md` and a card.
- `ui_kits/app/` — Flipbook mobile app click-through (Home, Lobby, Reader, Chat).
- `thumbnail.html` — project tile.
- `SKILL.md` — Agent Skill entry point.

### Components

Every component reads the style-scoped tokens and accepts `look="classic" | "glass"`. Cards show Classic and Glass in Light, Flip and Dark.

- **Button** — primary / secondary / ghost; lg, md, sm, pill; loading, disabled, focus.
- **Badge** — Founding Host, Author, Pro, Live, REC.
- **Banner** — inline positive, warning, error; Glass card or pill with status disc.
- **Toast** — floating status message (split from Banner).
- **BookCard** — cover, title, author, access state, social proof.
- **BookCover** — 2:3 cover with hairline (from the BookCard spec).
- **ChatMessage** — theirs, mine, veiled, quote card, removed. Also exports **Veil**.
- **VoiceNote** — player with waveform and speed; recording; veiled.
- **MarginReaction** — reaction / own / thread markers. **MarginAhead** — the ahead-of-you hint.
- **ReactionPicker** — six reactions or a 200-character comment.
- **MemberProgress** — Lobby chapter rail and alphabetical list.
- **SessionCard** — live session with catch-up note. **LiveBar** — floating live pill.
- **Icon** — Hugeicons subset at brand sizes.
- **AppHeader** — title, back button, grouped action pill.
- **SegmentedTabs** — two to four views of one screen.
- **TabBar** — main navigation; floating glass pill.
- **Sheet** — bottom sheet with grabber and footer.
- **OptionRow** — single-choice row with radio.
- **Composer** — chat input with mic / send.
- **Emblem** — community emblem, initial fallback.
- **UnreadDot** — quiet 7px unread marker.

### Intentional additions

- **Icon** — wraps the Hugeicons subset the components need.
- **Glass update (v2, 7 Oct 2026)** — Glass style, Toast split from Banner, and AppHeader, SegmentedTabs, TabBar, Sheet, OptionRow, Composer, Emblem, UnreadDot, from the Read, Margin, Community and Chat glass screens.
- **BookCover**, **Veil**, **MarginAhead**, **LiveBar** — split out of the BookCard, ChatMessage, MarginReaction and SessionCard specs so they can be reused independently.
