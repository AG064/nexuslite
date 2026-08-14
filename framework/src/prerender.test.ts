import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { div, h1, p } from './nexuslite';
import { prerender } from './prerender';

let outDir: string;

beforeEach(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'nexuslite-prerender-'));
});

afterEach(async () => {
  await rm(outDir, { recursive: true, force: true });
});

const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
</head>
<body>
  <!--ROOT-->
</body>
</html>`;

describe('prerender', () => {
  it('renders a single route to index.html', async () => {
    const home = () => div([h1('Home')]);
    await prerender({
      routes: { '/': home },
      outDir,
      template: TEMPLATE,
    });
    const out = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(out).toContain('<h1>Home</h1>');
    expect(out).not.toContain('<!--ROOT-->');  // marker should be replaced
  });

  it('renders multiple routes to subdirectories', async () => {
    await prerender({
      routes: {
        '/': () => div(h1('Home')),
        '/about': () => div(h1('About')),
        '/projects': () => div(h1('Projects')),
        '/contact': () => div(h1('Contact')),
      },
      outDir,
      template: TEMPLATE,
    });

    expect(await readFile(join(outDir, 'index.html'), 'utf8')).toContain('Home');
    expect(await readFile(join(outDir, 'about', 'index.html'), 'utf8')).toContain('About');
    expect(await readFile(join(outDir, 'projects', 'index.html'), 'utf8')).toContain('Projects');
    expect(await readFile(join(outDir, 'contact', 'index.html'), 'utf8')).toContain('Contact');
  });

  it('passes initialState to render functions', async () => {
    const spy = vi.fn().mockImplementation((state: any) => div(`Theme: ${state.theme}`));
    await prerender({
      routes: { '/': spy },
      outDir,
      template: TEMPLATE,
      initialState: { theme: 'dark' },
    });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }), '/');
    const out = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(out).toContain('Theme: dark');
  });

  it('per-route state overrides initialState', async () => {
    const renderFn = (state: any) => div(`Page: ${state.page}`);
    await prerender({
      routes: {
        '/': renderFn,
        '/about': renderFn,
      },
      routeState: {
        '/': { page: 'home' },
        '/about': { page: 'about' },
      },
      initialState: { page: 'default' },
      outDir,
      template: TEMPLATE,
    });
    const home = await readFile(join(outDir, 'index.html'), 'utf8');
    const about = await readFile(join(outDir, 'about', 'index.html'), 'utf8');
    expect(home).toContain('Page: home');
    expect(about).toContain('Page: about');
  });

  it('supports { render, state } route config', async () => {
    await prerender({
      routes: {
        '/': { render: (s: any) => div(`v=${s.v}`), state: { v: 42 } },
      },
      outDir,
      template: TEMPLATE,
    });
    const out = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(out).toContain('v=42');
  });

  it('writes 404.html by default', async () => {
    await prerender({
      routes: { '/': () => div(h1('Home')) },
      outDir,
      template: TEMPLATE,
    });
    const notFound = await readFile(join(outDir, '404.html'), 'utf8');
    expect(notFound).toContain('<!DOCTYPE html>');
    expect(notFound).toContain('l.replace');
  });

  it('skips 404 generation when notFoundPath is false', async () => {
    await prerender({
      routes: { '/': () => div(h1('Home')) },
      outDir,
      template: TEMPLATE,
      notFoundPath: false,
    });
    await expect(readFile(join(outDir, '404.html'), 'utf8')).rejects.toThrow();
  });

  it('uses custom rootMarker', async () => {
    const customTemplate = `<html><body>{{CONTENT}}</body></html>`;
    await prerender({
      routes: { '/': () => div(h1('Hi')) },
      outDir,
      template: customTemplate,
      rootMarker: '{{CONTENT}}',
    });
    const out = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(out).toContain('<h1>Hi</h1>');
    expect(out).not.toContain('{{CONTENT}}');
  });

  it('calls transform hook for per-page customization', async () => {
    const transform = (html: string, path: string) =>
      html.replace('<title>Test</title>', `<title>${path} | Test</title>`);

    await prerender({
      routes: { '/about': () => div(h1('About')) },
      outDir,
      template: TEMPLATE,
      transform,
    });

    const out = await readFile(join(outDir, 'about', 'index.html'), 'utf8');
    expect(out).toContain('<title>/about | Test</title>');
  });

  it('returns the list of files written', async () => {
    const files = await prerender({
      routes: { '/': () => div('x'), '/a': () => div('a') },
      outDir,
      template: TEMPLATE,
    });
    expect(files.length).toBe(3);  // 2 routes + 404
    expect(files.some(f => f.endsWith('index.html'))).toBe(true);
    expect(files.some(f => f.endsWith('404.html'))).toBe(true);
    expect(files.some(f => f.endsWith(join('a', 'index.html')))).toBe(true);
  });

  it('refuses to write outside outDir (path traversal protection)', async () => {
    await expect(prerender({
      routes: { '/../../etc/passwd': () => div('evil') },
      outDir,
      template: TEMPLATE,
    })).rejects.toThrow();
  });

  it('escapes user content in pre-rendered HTML', async () => {
    await prerender({
      routes: { '/': () => div(p('<script>alert(1)</script>')) },
      outDir,
      template: TEMPLATE,
    });
    const out = await readFile(join(outDir, 'index.html'), 'utf8');
    expect(out).toContain('&lt;script&gt;');
    expect(out).not.toContain('<script>alert(1)</script>');
  });
});

// Helper: re-export vi for the test
import { vi } from 'vitest';
