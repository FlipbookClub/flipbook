# docs/v2 — what to read

Engineering source of truth for the Flipbook v2 build. Business, money and people documents stay in `business/`.

| File | What it is | Read when |
| --- | --- | --- |
| `prd.md` | The v2 Reader App PRD (user stories and acceptance criteria). Exported from the live PRD doc, which is canonical; re-export after it changes | Before any feature work |
| `roadmap.md` | The sprint order, goals, stories and exit gates; context only, the current spec decides scope | When planning, to avoid building ahead |
| `architecture.md` | Stack, the 14 architecture decisions, the three hard parts, data model, v1 migration | Before any code |
| `testing/strategy.md` | Test layers, spoiler invariants, money and access cases, device matrix | Before writing tests |
| `design-handoff/` | The designer's handoff: screen files (`*ScreenGlass.dc.html`, copy and states live in each file's logic class), Epic canvases, `_ds/` tokens and component reference | When building a screen; open only the screens the spec names |
| `specs/` | One execution spec per slice. **Only build what a spec covers** | Every session |
| `adr/` | One file per architecture decision | When a decision is questioned |

Reading order for a coding session: `CLAUDE.md` → `docs/v2/architecture.md` → the slice spec in `docs/v2/specs/` → the handoff screens that spec names.

`design-handoff/` ships without the designer's copy of the PRD (draft 4); `prd.md` here replaces it.
