# NexusLite

> A zero-dependency reactive frontend framework in TypeScript.
> Readable. Tiny. Predictable.

NexusLite is a small framework for building reactive web applications in
TypeScript. It provides elements, state management, routing, HTTP helpers,
drag-and-drop, and pre-rendering — all in a few thousand lines, with
**no runtime dependencies**. The whole framework bundles to under
**20KB gzipped** and you can read the entire core in an afternoon.

- **Zero dependencies** — pure web standards (DOM, `fetch`, `IntersectionObserver`)
- **TypeScript-first** — types for the entire public API
- **Reactive state** — explicit pub-sub store, no virtual-DOM surprises
- **Pre-rendering** — turn any app into static HTML at build time
- **Two routing modes** — Hash and History API, your choice
- **MIT licensed** — use it in any project, commercial or otherwise

## Installation

```bash
npm install nexuslite
```

Then import it:

```typescript
import { createApp, createStore, div, h1, button, on } from 'nexuslite';
```

Node 18+ and any modern browser (Chrome/Edge/Firefox/Safari from the last
couple of years).

## Quick start

```typescript
import { createApp, createStore, div, h1, button, on } from 'nexuslite';

const store = createStore({ count: 0 });

createApp({
  root: '#app',
  state: store,
  render: (state) => div([
    h1(`Count: ${state.count}`),
    button('+', on('click', () => store.setState({ count: state.count + 1 }))),
  ]),
});
```

That's a working counter — state, view, and event binding in one file.

## What's in the box

| Module | What it does |
|---|---|
| **Elements** | `div()`, `h1()`, `button()`, `input()`, `ul()`, `li()`, ... — 30+ HTML elements as composable functions |
| **State** | `createStore<T>()` — typed pub-sub state, `setState()`, `subscribe()`, `on(key, ...)` |
| **Routing** | `createRouter({ mode: 'history' \| 'hash' })` — both modes, params, guards, notFound |
| **HTTP** | `createHttp()` — `get/post/put/delete/patch` with JSON handling |
| **Pre-render** | `prerender()` (separate entry: `nexuslite/prerender`) — build-time SSG |
| **Lazy** | `createLazyContainer()` — `IntersectionObserver`-based list virtualization |
| **Drag and drop** | `createDragDropContainer()` with `draggable()` / `dropZone()` |
| **Patterns** | `card()`, `modal()`, `navbar()`, `alert()`, `spinner()` |
| **Layout** | `row()`, `column()`, `center()`, `grid()`, `flex()` |
| **Attributes** | `cls()`, `css()`, `on()`, `onMulti()`, `bindTo()`, `data()`, ... |
| **Strings** | `renderToString()` — turn element trees into HTML strings (used by prerender) |

## Pre-rendering to static HTML

The most distinctive feature: any NexusLite app can be pre-rendered to
static HTML at build time. SEO-friendly, no client-side hydration required.

```typescript
// build/prerender.ts
import { prerender } from 'nexuslite/prerender';

await prerender({
  routes: {
    '/': home,
    '/about': about,
    '/projects': projects,
  },
  initialState: { theme: 'dark', lang: 'en' },
  outDir: 'dist',
  template: readFileSync('src/index.template.html', 'utf8'),
});
```

Each route becomes a static HTML file at build time. The browser serves
plain HTML — fast, indexable, accessible. The framework is purely a
build tool for these apps; the runtime is whatever the user adds.

## Browser support

- Chrome / Edge / Firefox / Safari: latest 2 versions
- Node: 18+ (for the prerender build step)
- ESM first, CJS compatible (via `require` in the `exports` map)

## Bundle size

| Build | Raw | Gzipped |
|---|---|---|
| Core framework | ~33KB | **~9KB** |
| + prerender (Node only, not shipped to browser) | ~5KB | ~2KB |

## Architecture

The whole framework is one TypeScript file. State updates trigger
immediate, direct DOM repaints. There is no virtual DOM diffing,
no hidden compilation step, no scheduler. Updates are explicit and
traceable.

## Why NexusLite?

**Compared to React/Next.js:**
- No build-step debugging — NexusLite uses native TypeScript and DOM, no Babel/SWC/Turbopack
- Explicit pub-sub state — `store.setState()` directly triggers DOM repaints, no captured closure gotchas
- Tiny footprint — under 20KB gzipped core, no virtual DOM reconciler

**Compared to plain vanilla JS:**
- Declarative layouts — write `div([h1(...), p(...)])` instead of `createElement` + manual `appendChild` chains
- Synchronized state — the store keeps data and DOM in lockstep
- Built-in router, HTTP, drag-and-drop, lazy, pre-render — utilities ready to use

**Compared to minimalist frameworks (Hyperapp, Mithril, etc.):**
- No virtual-DOM diffing — direct DOM updates, transparent execution
- Direct element shorthands — `div()`, `h1()`, `button()` read like HTML

## Examples

The [`example/`](example/) directory has a real-world Kanban board that uses
every feature: state, routing, HTTP, drag-and-drop, lazy rendering. Run it
with:

```bash
cd framework
npm install
npm run build

cd ../example
npm install
npm run dev
```

Then open `http://localhost:5173/`.

## Documentation

- **API reference**: [`framework/README.md`](framework/README.md)
- **Architecture deep-dive**: see the [Wiki](https://github.com/AG064/nexuslite/wiki)
- **Changelog**: [`CHANGELOG.md`](CHANGELOG.md)

## Contributing

Issues and pull requests welcome. For major changes, please open an issue
first to discuss what you'd like to change. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — use freely in any project.

## Acknowledgements

Built from scratch in TypeScript. No frameworks were used to bootstrap it
(other than `tsc` and `vitest` for development).
