/**
 * prerender - build-time static-site generation for NexusLite apps.
 *
 * Run at build time (Node only) to render every route to a static HTML
 * file. Pairs with `renderToString` from the main framework to produce
 * HTML without needing a DOM.
 *
 * Usage:
 *
 *   import { prerender } from 'nexuslite/prerender';
 *   import { readFileSync } from 'node:fs';
 *   import { home, about, projects, contact } from './pages';
 *
 *   await prerender({
 *     routes: { '/': home, '/about': about, '/projects': projects, '/contact': contact },
 *     initialState: { theme: 'dark', lang: 'en' },
 *     outDir: 'dist',
 *     template: readFileSync('src/index.template.html', 'utf8'),
 *   });
 *
 * Notes:
 * - Render functions must be PURE: no fetch, no setTimeout, no DOM access.
 *   Fetch the data you need before calling prerender, or render a skeleton.
 * - Each route is rendered with the same `initialState` (or per-route state).
 *   Use path-specific data inside the render function, not in state.
 */

import { renderToString } from './nexuslite.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, sep } from 'node:path';

export type RenderFn = (state: any, path?: string) => any;

export interface RouteConfig {
  render: RenderFn;
  state?: any;
}

export type Routes = Record<string, RenderFn | RouteConfig>;

export interface PrerenderConfig {
  /** Map of path -> render function or { render, state } object. */
  routes: Routes;
  /** Output directory (created if missing). */
  outDir: string;
  /** HTML template with a root marker (default `<!--ROOT-->`). */
  template: string;
  /** Marker replaced with rendered HTML. Default `<!--ROOT-->`. */
  rootMarker?: string;
  /** Initial state passed to every render function. */
  initialState?: any;
  /** Per-route state overrides, keyed by path. */
  routeState?: Record<string, any>;
  /**
   * Path to render the 404 page at. Set to `false` to skip 404 generation.
   * Default: `/404.html`. The 404 HTML is `make404Html()` from the router.
   */
  notFoundPath?: string | false;
  /**
   * Per-path HTML transformation hook. Useful for injecting per-page
   * `<title>`, `<meta>`, JSON-LD, etc. into the template before writing.
   * Receives the rendered HTML and the path; returns the final HTML.
   */
  transform?: (html: string, path: string) => string;
  /** Pretty-print the output HTML. Default false. */
  pretty?: boolean;
}

function routeToConfig(r: RenderFn | RouteConfig): RouteConfig {
  if (typeof r === 'function') return { render: r };
  return r;
}

function pathToFile(outDir: string, routePath: string): string {
  // Normalize: '/about' -> 'about/index.html', '/' -> 'index.html'
  const clean = routePath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!clean) return join(outDir, 'index.html');
  return join(outDir, clean, 'index.html');
}

function injectTemplate(template: string, marker: string, html: string): string {
  if (template.includes(marker)) return template.replace(marker, html);
  // No marker found: append the HTML before `</body>`, or at the end.
  const bodyClose = template.lastIndexOf('</body>');
  if (bodyClose !== -1) {
    return template.slice(0, bodyClose) + html + template.slice(bodyClose);
  }
  return template + html;
}

/**
 * Render every route to a static HTML file. Returns the list of files written.
 */
export async function prerender(config: PrerenderConfig): Promise<string[]> {
  const {
    routes,
    outDir,
    template,
    rootMarker = '<!--ROOT-->',
    initialState = {},
    routeState = {},
    notFoundPath = '/404.html',
    transform,
    pretty = false,
  } = config;

  if (!outDir) throw new Error('prerender: outDir is required');
  if (!template) throw new Error('prerender: template is required');

  const written: string[] = [];
  await mkdir(outDir, { recursive: true });

  for (const [routePath, rawConfig] of Object.entries(routes)) {
    const cfg = routeToConfig(rawConfig);
    const { render } = cfg;
    // State precedence: routeState (map) > cfg.state > initialState
    const state = { ...initialState, ...(cfg.state || {}), ...(routeState[routePath] || {}) };
    const tree = render(state, routePath);
    let html = renderToString(tree);
    if (pretty) html = prettyHtml(html);
    let page = injectTemplate(template, rootMarker, html);
    if (transform) page = transform(page, routePath);

    const filePath = pathToFile(outDir, routePath);
    const safe = normalize(filePath);
    if (!safe.startsWith(normalize(outDir))) {
      throw new Error(`prerender: refusing to write outside outDir: ${filePath}`);
    }
    await mkdir(dirname(safe), { recursive: true });
    await writeFile(safe, page, 'utf8');
    written.push(safe);
  }

  // Generate 404.html using the router's make404Html() helper.
  if (notFoundPath) {
    const { make404Html } = await import('./nexuslite.js');
    const notFoundFile = join(outDir, notFoundPath.replace(/^\/+/, ''));
    await writeFile(notFoundFile, make404Html(), 'utf8');
    written.push(notFoundFile);
  }

  return written;
}

function prettyHtml(html: string): string {
  // Very lightweight pretty-printer: add a newline between sibling block tags.
  // Not a full HTML formatter; just makes diffs readable.
  return html
    .replace(/>\s*</g, '>\n<')
    .replace(/(<\/(div|section|article|main|header|footer|nav|ul|ol|li|p|h[1-6]|form|table|tr|td|th|blockquote|pre)>\s*)/g, '$1\n');
}

export default prerender;
