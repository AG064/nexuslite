# NexusLite: Frontend Framework from Scratch

A lightweight, zero-dependency reactive frontend framework built from scratch in TypeScript.

NexusLite is designed with a singular, clear goal: **perfect readability**. A developer can look directly at the framework's core source code and immediately understand how reactive UI rendering, state management, and routing behaves on the web.

---

## Why Use NexusLite Instead of react / next.js or No Framework at All?

Here is where NexusLite fits into the modern web ecosystem and why it stands out:

### 1. Compared to React and Next.js
* **Zero build-step friction:** React and Next.js require massive build configurations, compiler steps (Babel, SWC, Turbopack), and hydration engines. If something breaks, you end up debugging machine-generated code. NexusLite uses native TypeScript and DOM structures with absolutely zero magical compilation passes.
* **Transparent reactive stream:** React state is filled with edge cases like captured closures or re-render traps. NexusLite relies on an explicit Publish-Subscriber state machine. You update state using `store.setState()`, which instantly triggers predictable DOM repaints.
* **Perfect for low-power environments:** React carries substantial file size and memory footprint. NexusLite builds into a tiny direct-compile bundle. It constructs actual elements in a single sequential layout pass, bypassing the memory-heavy Fiber reconciliation loops entirely.

### 2. Compared to Plain Vanilla JS (No Framework)
* **Declarative vs Imperative code:** In vanilla JS, you write endless imperative lines of `document.createElement`, setting classes, and appending nodes manually. With NexusLite, your layouts are declarative, representing children, elements, styles, and events in clean nested syntax resembling natural HTML.
* **Synchronized state:** In plain JS, keeping data sets aligned with elements requires fragile manual query-selectors and element targeting. NexusLite automatically repaints elements when changes hit the central store.
* **Optimized utilities included:** To handle common SPA demands, NexusLite packages a hash-based router and a viewport-aware list lazy loader using highly-optimized browser `IntersectionObserver` elements right out of the box, preserving native performance.

### 3. Compared to Minimalist Frameworks (like Hyperapp, Backbone, or Mithril)
* **No synthetic abstract layer:** Modern micro-frameworks like Hyperapp require highly complex Virtual-DOM diffing algorithms. When children arrays shift, those engines must run recursive diffs to calculate patches, which can introduce edge cases. NexusLite values code transparency over algorithmic complexity. State updates trigger immediate, direct DOM element repaints on the registered root element, keeping the code highly maintainable and free of hidden scheduling abstractions.
* **Direct DOM Shorthands:** To build elements, other light frameworks rely strictly on nested `h()` configurations. NexusLite exposes clear shorthand HTML elements (`div()`, `p()`, `button()`) with automatic parameter parsing built in, yielding significantly cleaner layouts.

---

## The Philosophy

1. **Readability First:** Code reads like pure semantic HTML layout hierarchies within standard JavaScript/TypeScript files.
2. **0 Dependencies:** Built purely on native web APIs (standard DOM manipulation, IntersectionObserver, and window location updates). No external dependencies under runtime.
3. **No Magic:** No complex, hidden compilation passes, and no mystery React Fiber or Zone.js runtimes. State updates follow a direct, clean publish-subscribe pattern that triggers fast, predictable view updates.

---

## Repository Structure

- [framework/](framework/) - Core source code, typing schemas, and internal test suites.
  - [framework/src/nexuslite.ts](framework/src/nexuslite.ts) - The heart of the framework (DOM builder, state store, Client Router, HTTP client, and IntersectionObserver Lazy container).
- [example/](example/) - A complete, real-world Single Page Kanban application utilizing 100% of the developed feature set.

---

## Quick Start Example

Add standard elements to the page, wire up custom reactivity with standard store bindings, and bootstrap:

```typescript
import { createApp, createStore, div, h1, button, css } from 'nexuslite';

// Define a reactive store
const store = createStore({ count: 0 });

// Render responsive UI bound directly to state updates
function renderApp(state: { count: number }) {
  return div({ id: 'app-root' }, [
    h1(`Current Count: ${state.count}`),
    button('Increment', {
      on: { click: () => store.setState({ count: state.count + 1 }) }
    })
  ]);
}

// Bootstrap application on target container
createApp({
  root: '#app',
  state: store,
  render: renderApp
});
```

---

## Architecture and Feature Tour

### 1. Element Generation (`createDOM` and Shorthands)
Instead of manually typing `document.createElement` strings everywhere, element factories construct standard configuration objects representing HTML elements.
- Shorthand helpers (`div()`, `p()`, `button()`, `input()`, etc.) handle variable arguments smoothly so child arrays and attribute dictionaries are normalized automatically.
- High-level properties like event lists, class names, datasets, and flex layout helpers map directly to native DOM node modifiers during rendering.

### 2. State Management (`createStore`)
A pure Publisher-Subscriber store configuration. State transitions are atomic, explicit, and lightweight. When state updates occur via `store.setState()`, registered callbacks notify observers and re-render the target root element instantly.

### 3. Progressive Routing (`createRouter`)
A hash-based SPA (`#/path`) routing implementation. It maps URL hash changes recursively to state triggers, avoiding tricky backend server configurations. The router parses clean route maps and exposes programmable navigation actions (`router.navigate('/path')`).

### 4. Advanced Performance (Viewport-Based Lazy Render)
Large arrays of data can easily degrade browser layout performance. NexusLite implements `createLazyContainer()` - a reactive wrapper using the native `IntersectionObserver`. List rows are mounted and rendered only as they physically enter the container's viewport, maintaining a fluid 60 FPS scrolling experience.

### 5. Native Event Handling and Delegation
Events are defined declaratively as properties during render time. The framework supports event delegation, preventing default transitions and stopping propagation where custom flow control is needed.

---

## Build and Running Instructions

To compile, test, and run locally, execute:

```powershell
# 1. Build the framework output bundles
cd framework
npm install
npm run build

# 2. Run the test harness
npm run test:run

# 3. Compile and launch the Kanban App locally
cd ../example
npm install
npm run dev
```
Open **`http://localhost:5173/`** to view the application live.

1. **Type safety** catches bugs at compile time, not runtime
2. **Self-documenting code** — interfaces make the architecture obvious
3. **Better IDE support** — autocompletion, refactoring tools
4. **Framework-quality code** — the task is to demonstrate skill, not write quick hacks

### Why Custom Element trees instead of full Virtual-DOM Diffing?

Full Virtual-DOM trees and dynamic diffing engines (like React Fiber) introduce deep recursive comparisons, hook tracking, and hidden scheduling loops that make code difficult to debug.
Our direct re-render model creates standard JS objects to represent nodes and renders them in a single fast, clean pass. State updates simply replace targeted container roots. This keeps performance incredibly high while leaving the execution path 100% transparent.

### Why Hash-based Routing?

Server-configured routing (the History API) requires specific backend routing fallback configuration. Hash routing (`#/path`) works instantly on any static host out-of-the-box — the hash is managed entirely on the client, always loading our single SPA bundle seamlessly.

### Why Event Delegation?

Individually attaching click handlers to thousands of table or list rows uses non-trivial memory and causes browser performance degradation. Event delegation assigns a single, central listener to the parent element, letting events bubble up naturally to resolve targets dynamically.

### Why declarative properties instead of manual `addEventListener`?

In standard reactive environments, you shouldn't call modern imperative query selectors and `addEventListener` after rendering. Nexus.js handles this declaratively: callback properties are defined alongside elements inside the render configurations. We bind them directly during node initialization in the compilation loop.