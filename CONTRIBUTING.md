# Contributing to NexusLite

Thanks for your interest in improving NexusLite. The framework is small
on purpose — every change should keep it that way.

## What we want

- **Bug fixes** — open an issue first, then a PR with a failing test
- **Performance improvements** — with before/after numbers
- **Documentation** — clearer examples, better JSDoc
- **Test coverage** — the goal is to keep the ratio of test code to
  source code above 1:1

## What we don't want

- **Framework creep** — feature requests for things other frameworks
  already do better. NexusLite is intentionally small.
- **Magic** — no hidden abstractions, no automatic behavior users
  can't see in the source
- **Build complexity** — no new build tools, no new transpilers
- **Breaking changes without discussion** — open an issue first

## Development setup

```bash
git clone https://github.com/AG064/nexuslite.git
cd nexuslite/framework
npm install
npm run test:run
```

The test suite uses Vitest with jsdom. All 118 tests should pass.

## Pull request process

1. **Open an issue first** for non-trivial changes. Frame it as a question
   or proposal so we can discuss before you spend hours on it.
2. **Fork the repo** and create a feature branch (`feat/your-thing` or
   `fix/your-thing`).
3. **Add a test** for any new feature or bug fix. Tests live in
   `framework/src/nexuslite.test.ts` and `framework/src/prerender.test.ts`.
4. **Run the full suite** and make sure everything passes.
5. **Update CHANGELOG.md** under the "Unreleased" section.
6. **Push** to your fork and open a PR against `main` (or `dev` if
   we're in a feature cycle).
7. **Wait for review** — the maintainer will look at it as soon as
   they can. Be patient.

## Code style

- TypeScript, strict mode
- 2-space indentation
- Single quotes for strings
- No semicolons missing, no semicolons where they're not needed
- Run `npm run typecheck` before committing

## Bundle size budget

The whole framework should stay under **20KB gzipped** (currently ~9KB).
Before adding anything, check the bundle size. If your change pushes it
over the budget, it's too much.

## License

By contributing, you agree that your contributions will be licensed
under the MIT License.
