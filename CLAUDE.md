# CLAUDE.md

## Commands

```bash
npm run dev           # Vite dev server
npm test              # Vitest, node environment, src/**/*.test.js
npm run test:e2e      # Playwright (desktop + Pixel 5) against `vite build && vite preview` on :4173
npm run lint          # ESLint (flat config); lint:fix to apply
npm run format:check  # Prettier (no semicolons, single quotes, printWidth 120); format to apply
npm run build         # production build to dist/
```

CI (`.github/workflows/ci.yml`) runs lint, format check, unit tests, build and E2E on every push to `main` and on PRs. `docs/demo.gif` is the README demo; re-record it if the UI changes noticeably.

## Architecture

Portfolio v2 as a fake OS, deployed as its own Vercel project (`leonel-os` → https://os.leonelrosado.dev, separate from v1 at leonelrosado.dev; see README → Deploy): Vue 3 (`<script setup>`, plain JavaScript), Vite 5, Tailwind 3, vue-i18n 11 (`legacy: false`), Vitest, Vercel. Content is ported from v1 (`../portfolio`).

- `src/os/` is plain JS with no Vue, `window` or `document`. All side effects go through `ctx`.
  - `fs/buildFs.js` builds the virtual tree (`/root/...`) from i18n + `src/data/profile.js`. Node types: `dir`, `file` (content = output blocks), `link` (`action: open | download | image`), `exec`. Paths must not depend on the language.
  - `shell/run.js` `runLine(line, ctx)` is an async generator. It yields output blocks or `{ type: 'prompt' }` and receives answers via `next()`. It supports `&&`, turns paths with `/` into executables, and turns thrown errors into an error block.
  - `commands/*.js`: `{ name, aliases?, hidden?, summary(t), run(ctx, args, invokedAs) }`. Register new ones in `commands/index.js` (order = `help` order). Hidden commands (easter eggs) skip help, suggestions and Tab.
  - `blocks.js` lists every output block type. `components/OutputBlock.vue` renders them without `v-html`.
- `composables/useShell.js` `createShell(env)` owns cwd, lines, history, the pending prompt and the intro. `submit` = typed input (an answer while prompted). `runCommand` = clicks/chips (cancels a pending prompt first). `TerminalWindow.vue` creates it and `provide`s it as `'shell'`.
- Suggestions (IntelliSense-style list in `PromptLine.vue`) and Tab share `shell/complete.js`. Commands declare their arguments with `args(ctx)` (fixed values, e.g. `lang`, `theme`) or `paths: true | 'dir'` (`ls`, `cat`, `open`, `cd`). Commands without either get no argument suggestions. `run.js` `argLimit` caps the operands (flags don't count): `maxArgs` if declared (e.g. `cat: Infinity`), otherwise 1 with `args`/`paths` and 0 without. Easter eggs are unlimited. Going over the limit prints `<cmd>: too many arguments`, and suggestions stop at the limit.
- Screenshots: a folder made only of image links (`fs/gallery.js` `isImageDir`) opens as a `gallery` block (in each project README too). `OutputBlock.vue` shows thumbnails, and `ImageLightbox.vue`, teleported to `<body>`, is the full-screen viewer (←/→, Esc).
- Easter egg `matrix`: the command calls `ctx.matrix()`, and `TerminalWindow` mounts `MatrixRain.vue` (a full-screen canvas whose colors come from the active palette's tokens; any key, click or 8 s closes it; skipped with reduced motion).
- Boot: `os/boot/script.js` (log + timing) and `BootScreen.vue`. `App.vue` picks `full | short | none` from `localStorage.bootSeen` and `prefers-reduced-motion`.

### Conventions

- Copy: v1 strings in `src/i18n/lang/{en,es}.json`, terminal strings in `term.{en,es}.json` (merged under `term`). Every key goes in both languages (`messages.test.js` enforces it). Write a literal `|` as `{'|'}` and a literal `@` as `{'@'}`.
- E2E specs live in `e2e/` and share `e2e/helpers.js` (`openTerminal` seeds localStorage for a short boot, `run` types and submits a command). They mock `api.web3forms.com`, so they never send mail.
- Prettier with `semi: false` can break multi-statement inline Vue handlers (`@x="a = 1; b()"`). Use a function in `<script setup>` instead.
- Tests use `src/test/makeT.js` (real messages; unknown keys throw), `src/test/shell.js` (`makeCtx`, `run`) and `src/test/blocks.js` (`textOf`).
- Colors: only `term-*` tokens (RGB CSS vars per `[data-theme]` in `style.css`). Palettes `green | amber | dracula | light` must stay in sync across `style.css`, `useTheme.js` and the inline script in `index.html`.
- The banner logo (`os/boot/banner.js`) must stay printable ASCII. The web font subset has no box-drawing glyphs, and `banner.test.js` enforces it.
- Tab icon: `lib/favicon.js` builds an SVG terminal icon from `--term-bg`/`--term-accent`. `main.js` calls it on load and `useTheme` on every theme change. `public/favicon.svg` is the green fallback.
- `localStorage` only via `safeStorage()` (keys: `lang`, `theme`, `bootSeen`).
- Contact goes through Web3Forms (`os/net/web3forms.js`, `VITE_WEB3FORMS_KEY`). A 200 response with `success:false` counts as a failure.
