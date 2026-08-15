# NexusLite Framework

The framework source lives in this directory. The public API is exported
from `src/nexuslite.ts` and built to `dist/`.

- Main entry: `nexuslite` - `div`, `h1`, `createStore`, `createApp`,
  `createRouter`, `createHttp`, `bindTo`, ...
- Build-time entry: `nexuslite/prerender` - `prerender()` for static
  site generation
- Source: [`src/nexuslite.ts`](src/nexuslite.ts) - one file, ~1500 lines
- Tests: [`src/nexuslite.test.ts`](src/nexuslite.test.ts) and
  [`src/prerender.test.ts`](src/prerender.test.ts)

For an overview of the framework and how to use it, see the
[main README](../README.md).

## Build

```bash
npm install
npm run build       # compile TypeScript to dist/
npm run test:run    # run the test suite
npm run test:ui     # run with the Vitest UI
```

## Project layout

```
framework/
├── src/
│   ├── nexuslite.ts          # main framework source
│   ├── nexuslite.test.ts     # framework tests
│   ├── prerender.ts          # prerender() function
│   └── prerender.test.ts     # prerender() tests
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

The build outputs to `dist/`. The main `nexuslite` package and the
`nexuslite/prerender` sub-entry are both produced from these sources.
