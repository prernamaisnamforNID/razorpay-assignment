# Myra · Family Trip Planner — notes for Claude

Read `PROJECT_STRUCTURE.md` first: folders, tokens, journey, scenarios.
Plain HTML + CSS + JS (ES modules). No framework, no build step. Hosted on GitHub Pages.

## Local dev

- Server: **Simple Web Server** (Windows app), already running. It serves the repo root
  `C:\Users\prern\OneDrive\Documents\GitHub\razorpay-assignment`.
- URLs:
  - Documentation: http://127.0.0.1:8083/
  - Prototype: http://127.0.0.1:8083/prototype/
- Do **not** start any other dev server (no Live Server, npm, `python -m http.server`, etc.).
  Assume the Simple Web Server is running.
- Use **relative paths only** (`css/app.css`, `../`). Never start a path with `/` — the same
  files must work at 127.0.0.1:8083 and on GitHub Pages under `/razorpay-assignment/`.
- After a change, say which URL to open to check it.

## Prototype conventions

- All copy, prompts and timings live in `prototype/data/journey.js`.
- One module per screen in `prototype/js/screens/`; shared pieces in `prototype/js/components/`.
- Match Figma via the Figma MCP (`get_design_context`); download assets into `prototype/assets/`
  — never reference temporary Figma URLs.
- Respect `prefers-reduced-motion` (fades only, shorter delays). No console errors.
- Test in Chrome desktop and DevTools iPhone 14 (390 × 844).
