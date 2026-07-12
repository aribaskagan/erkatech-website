# AGENTS.md

## Project overview

ErkaTech marketing website — a single-page, Apple-style landing page for an early-stage
robotics startup building Hall-effect magnetic tactile sensors. Static site, zero build
step, zero dependencies. For full project background, design rationale, and iteration
history, read **`PROJECT_CONTEXT.md`** first — it has everything an agent needs to avoid
re-deriving decisions already made.

## Dev environment tips

- There is no package manager, no build step, and no dev server required.
- To preview: open `index.html` directly in a browser (double-click it, or
  `file:///path/to/index.html`). All assets are relative paths, so it works from disk.
- Do not add a bundler, framework, or npm dependency unless explicitly asked — the
  zero-dependency setup is an intentional decision (see `PROJECT_CONTEXT.md` §2), not an
  oversight.
- Files: `index.html` (markup/content), `style.css` (all styles), `script.js` (all
  behavior), `i18n.js` (TR/EN translation dictionaries + modal content), `assets/`
  (images/logo).

## Code style

- Plain HTML5 / CSS3 / vanilla ES2017+ JS. No TypeScript, no JSX, no framework.
- `script.js` is a single IIFE (`(function () { "use strict"; ... })()`), organized into
  clearly commented sections (language toggle, reveal-on-scroll, scroll-zoom panel,
  scrollbar, modal). Keep new behavior in this same file, in its own commented section,
  unless it grows large enough to warrant a new file (then `<script src="...">` it after
  `script.js` in `index.html`).
- CSS uses custom properties defined in `:root` (`--bg`, `--fg`, `--gray`, `--line`,
  `--panel-bg`, `--ease`). Reuse these instead of hardcoding colors — the palette is
  strictly black/white/gray by explicit design decision.
- No CSS framework (no Tailwind/Bootstrap). Class names are plain, readable, kebab-case
  (`.hero-headline`, `.panel-frame`, `.tile-thumb`).
- All user-facing text goes through the i18n system: add `data-i18n="section.key"` to the
  element, then add the matching key to **both** `translations.tr` and `translations.en`
  in `i18n.js`. Never hardcode Turkish or English strings directly in `index.html` for
  content that should be translatable.
- Section pattern to follow when adding a new content section: wrap in
  `<section class="block">`, use `.block-head` for the title/intro, add `.reveal` to
  elements that should fade in on scroll (handled automatically by the
  `IntersectionObserver` in `script.js`).

## Testing instructions

- There is no automated test suite (no Jest/Vitest/etc. — not warranted for a static
  marketing site). Verification is manual:
  1. Open `index.html` in a real browser and visually check the change.
  2. If you don't have browser/GUI access, at minimum run static sanity checks:
     - `node --check script.js` and `node --check i18n.js` (syntax validity)
     - Confirm every `assets/...` path referenced in `index.html`/`script.js`/`i18n.js`
       actually exists in `assets/`
     - Confirm every `data-i18n="key"` in `index.html` has a matching key in **both**
       `translations.tr` and `translations.en` in `i18n.js`
  3. Prefer opening the file via the real OS file browser / real browser over spinning up
     a local HTTP server — this is a `file://`-compatible static site by design, so a
     server should never become a hard requirement for previewing it.
- Fix any broken asset reference, missing translation key, or JS syntax error before
  considering a task done.

## PR / commit instructions

- No CI pipeline exists yet. If one is added, wire the checks from "Testing instructions"
  above into it.
- Keep commits/changes scoped: this is a fast-moving early-stage prototype, prefer small
  additive diffs over large rewrites unless the user explicitly asks for a redesign.

## Content notes (read before editing copy)

- Most body copy (team info, stats like "3×3 sensor matrix", the contact email
  `hello@erkatech.co`) is **placeholder** pending real company details — see
  `PROJECT_CONTEXT.md` §10 for the exact list. Don't treat placeholder numbers as real
  facts to build further features on top of; flag it back to the user if a task depends
  on one of them being accurate.
- The color palette is intentionally black/white only — do not introduce accent colors
  without explicit user request.
