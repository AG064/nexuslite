# Changelog

All notable changes to NexusLite are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- `delegate(root, event, selector, handler)` — event delegation helper,
  one listener handles many dynamic targets. Returns an unsubscribe function.
- `inputType` alias for `type()` — easier to import without `as` rename
- `bindTo(store, key, transform?)` helper for two-way input binding to a store
- `cls(...names)` now filters falsy values, so `cls('btn', isActive && 'btn--active')` works
- `createStore<T>()` accepts a generic type parameter for typed state
- `prerender()` — build-time SSG; renders every route to a static HTML file
- `renderToString()` — turn element trees into HTML strings, no DOM required
- `createRouter({ mode: 'history' | 'hash' })` — History API support (hash stays default)
- `make404Html()` — generate a GitHub-Pages-compatible SPA fallback
- 12 `prerender()` tests, 17 `renderToString` tests, 5 typed-store tests,
  2 `cls` tests, 3 `bindTo` tests, 1 `inputType` test, 3 `delegate` tests

### Fixed
- `isPlainObject` no longer references `Node` directly; it works in pure Node
  (no DOM) so the framework is usable at build time
- `Router.navigate()` no longer produces doubled slashes for paths like
  `'/about'`
- `Router.getPath()` correctly strips a configured `base` path (off-by-one fix)

### Changed
- Framework bumped to 1.1.0 (additive changes, no breaking changes)
- `RenderFn` type now takes optional `path` argument (back-compat)
- `prerender.ts` import paths now include `.js` extensions (Node ESM compat)
- Repersonalized the framework: removed AG064-specific framing from
  README, added MIT `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md`,
  bumped to 1.1.0 in `package.json` with proper repository metadata
- New main `README.md` is the public face; `framework/README.md` is just
  the API reference

## [1.0.0] — Initial release

- Element functions: `div`, `h1`, `button`, `input`, `ul`, `li`, and 30+ others
- State: `createStore()` with `setState`, `subscribe`, `on`
- Router: hash-based, with `init`, `route`, `navigate`, `getPath`
- HTTP: `createHttp()` with `get`, `post`, `put`, `delete`, `patch`
- Lazy: `createLazyContainer()` with `IntersectionObserver`
- Drag and drop: `createDragDropContainer()` with `draggable`, `dropZone`
- Patterns: `card`, `modal`, `navbar`, `alert`, `spinner`
- Component: `class Component` with `mount`, `setState`
- App: `createApp({ root, state, render })`
- 77 unit tests
