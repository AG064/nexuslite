/**
  NexusLite - A small and comfortable frontend framework
  
  Primary API is designed to be intuitive and readable:
 - Element functions: div(), h1(), button(), input(), etc.
 - Attribute helpers: cls(), css(), id(), on(), etc.
 - Layout helpers: row(), column(), center(), grid()
 - State: createStore()
 - Router: createRouter()
 - HTTP: createHttp()
 - App: createApp()
  
  Everything is vanilla TypeScript, no external frameworks.
 */

// TYPES

type Attrs = Record<string, any>;
type Styles = Record<string, string | number>;
type EventHandler = (event: Event) => void;
type Children = any;

export interface NexusLiteElement {
  type: string;
  props: Record<string, any>;
  children: (NexusLiteElement | string | number)[];
  key?: string;
}

function isNexusLiteElement(value: any): value is NexusLiteElement {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && typeof value.type === 'string');
}

function isPlainObject(value: any): value is Record<string, any> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value) && !isNexusLiteElement(value) && !(value instanceof Node));
}

function isAttrsObject(value: any): boolean {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  if (keys.length === 0) return false;
  return keys.some((key) =>
    key === 'className' ||
    key === 'style' ||
    key === 'id' ||
    key === 'draggable' ||
    key === 'on' ||
    key === 'href' ||
    key === 'target' ||
    key === 'rel' ||
    key === 'src' ||
    key === 'alt' ||
    key === 'title' ||
    key === 'placeholder' ||
    key === 'value' ||
    key === 'type' ||
    key === 'name' ||
    key === 'checked' ||
    key === 'disabled' ||
    key === 'required' ||
    key === 'autofocus' ||
    key === 'readonly' ||
    key === 'readOnly' ||
    key === 'rows' ||
    key === 'cols' ||
    key.startsWith('data-') ||
    key.startsWith('aria-')
  );
}

function isAttrsArray(value: any): boolean {
  return Array.isArray(value) && value.length > 0 && value.every((item) => isAttrsObject(item));
}

function mergeAttrs(...sources: any[]): Attrs {
  const result: Attrs = {};
  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) {
      for (const item of source) {
        Object.assign(result, mergeAttrs(item));
      }
      continue;
    }
    if (isAttrsObject(source)) {
      Object.assign(result, source);
    }
  }
  return result;
}

function normalizeElementArgs(contentOrAttrs?: any, attrsOrContent?: any): { content: any; attrs: Attrs } {
  if (attrsOrContent === undefined) {
    if (isAttrsObject(contentOrAttrs) || isAttrsArray(contentOrAttrs)) {
      return { content: undefined, attrs: mergeAttrs(contentOrAttrs) };
    }
    return { content: contentOrAttrs, attrs: {} };
  }

  if (isAttrsObject(contentOrAttrs) || isAttrsArray(contentOrAttrs)) {
    return { content: attrsOrContent, attrs: mergeAttrs(contentOrAttrs) };
  }

  if (isAttrsObject(attrsOrContent) || isAttrsArray(attrsOrContent)) {
    return { content: contentOrAttrs, attrs: mergeAttrs(attrsOrContent) };
  }

  return { content: contentOrAttrs, attrs: mergeAttrs(attrsOrContent) };
}

// CORE ELEMENT SYSTEM

export function h(type: string, props: Attrs = {}, ...children: any[]): NexusLiteElement {
  return {
    type,
    props: { ...props },
    children: flattenChildren(children),
    key: props.key || undefined,
  };
}

function flattenChildren(children: any[]): (NexusLiteElement | string | number)[] {
  const result: (NexusLiteElement | string | number)[] = [];
  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else if (typeof child !== 'boolean') {
      result.push(child);
    }
  }
  return result;
}

// ELEMENT FUNCTIONS (PRIMARY API)

function el(tag: string, content?: any, attrs?: any): NexusLiteElement {
  const { content: normalizedContent, attrs: normalizedAttrs } = normalizeElementArgs(content, attrs);

  if (normalizedContent === undefined) return h(tag, normalizedAttrs || {});
  if (typeof normalizedContent === 'string' || typeof normalizedContent === 'number') return h(tag, normalizedAttrs || {}, normalizedContent);
  if (Array.isArray(normalizedContent)) return h(tag, normalizedAttrs || {}, ...normalizedContent);
  if (isNexusLiteElement(normalizedContent)) return h(tag, normalizedAttrs || {}, normalizedContent);
  return h(tag, normalizedAttrs || {});
}

// Block elements
export function div(content?: any, attrs?: any) { return el('div', content, attrs); }
export function span(content?: any, attrs?: any) { return el('span', content, attrs); }
export function p(content?: any, attrs?: any) { return el('p', content, attrs); }
export function h1(content?: any, attrs?: any) { return el('h1', content, attrs); }
export function h2(content?: any, attrs?: any) { return el('h2', content, attrs); }
export function h3(content?: any, attrs?: any) { return el('h3', content, attrs); }
export function h4(content?: any, attrs?: any) { return el('h4', content, attrs); }
export function h5(content?: any, attrs?: any) { return el('h5', content, attrs); }
export function h6(content?: any, attrs?: any) { return el('h6', content, attrs); }
export function a(content?: any, attrs?: any) { return el('a', content, attrs); }
export function strong(content?: any, attrs?: any) { return el('strong', content, attrs); }
export function em(content?: any, attrs?: any) { return el('em', content, attrs); }
export function small(content?: any, attrs?: any) { return el('small', content, attrs); }
export function blockquote(content?: any, attrs?: any) { return el('blockquote', content, attrs); }
export function code(content?: any, attrs?: any) { return el('code', content, attrs); }
export function pre(content?: any, attrs?: any) { return el('pre', content, attrs); }

// Interactive elements
export function button(content?: any, attrs?: any) { return el('button', content, attrs); }
export function input(attrs?: any) { return h('input', attrs || {}); }
export function textarea(content?: any, attrs?: any) { return el('textarea', content, attrs); }
export function select(children?: any, attrs?: any) { return el('select', children, attrs); }
export function option(label?: any, value?: any, attrs?: any) { return el('option', label, { value, ...attrs }); }

// Lists
export function ul(items?: any, attrs?: any) { return el('ul', items?.map ? items.map((item: any) => li(item)) : items, attrs); }
export function ol(items?: any, attrs?: any) { return el('ol', items?.map ? items.map((item: any) => li(item)) : items, attrs); }
export function li(content?: any, attrs?: any) { return el('li', content, attrs); }

// Media
export function img(src?: any, attrs?: any) { return h('img', { src, ...attrs }); }
export function video(attrs?: any) { return h('video', attrs || {}); }
export function audio(attrs?: any) { return h('audio', attrs || {}); }

// Structure
export function nav(children?: any, attrs?: any) { return el('nav', children, attrs); }
export function header(children?: any, attrs?: any) { return el('header', children, attrs); }
export function footer(children?: any, attrs?: any) { return el('footer', children, attrs); }
export function main(children?: any, attrs?: any) { return el('main', children, attrs); }
export function section(children?: any, attrs?: any) { return el('section', children, attrs); }
export function article(children?: any, attrs?: any) { return el('article', children, attrs); }
export function aside(children?: any, attrs?: any) { return el('aside', children, attrs); }

// Form elements
export function form(children?: any, attrs?: any) { return el('form', children, attrs); }
export function label(content?: any, attrs?: any) { return el('label', content, attrs); }
export function fieldset(children?: any, attrs?: any) { return el('fieldset', children, attrs); }
export function legend(content?: any, attrs?: any) { return el('legend', content, attrs); }

// Other
export function br() { return h('br', {}); }
export function hr(attrs?: Attrs) { return h('hr', attrs || {}); }
export function spacer(size = 16) { return div('', css({ height: size + 'px' })); }

// ATTRIBUTE HELPERS

export function cls(...names: string[]) { return { className: names.join(' ') }; }
export function css(styles: Styles) { return { style: styles }; }
export function id(name: string) { return { id: name }; }
export function data(key: string, value: string) { return { ['data-' + key]: value }; }
export function on(event: string, handler: EventHandler) { return { on: { [event]: handler } }; }
export function onMulti(events: Record<string, EventHandler>) { return { on: events }; }
export function href(url: string, target?: string) { return target ? { href: url, target } : { href: url }; }
export function ph(text: string) { return { placeholder: text }; }
export function type(t: string) { return { type: t }; }
export function name(n: string) { return { name: n }; }
export function val(v: string | number | boolean) { return { value: v }; }
export function disabled() { return { disabled: true }; }
export function required() { return { required: true }; }
export function autofocus() { return { autofocus: true }; }
export function readonly() { return { readOnly: true }; }
export function checked() { return { checked: true }; }

// LAYOUT HELPERS

export function row(children: any[], gap = 16) {
  return div(children, css({ display: 'flex', gap: gap + 'px', alignItems: 'center' }));
}

export function column(children: any[], gap = 16) {
  return div(children, css({ display: 'flex', flexDirection: 'column', gap: gap + 'px' }));
}

export function center(children: any[], maxWidth = 1200) {
  return div(children, css({ maxWidth: maxWidth + 'px', margin: '0 auto', padding: '0 20px' }));
}

export function grid(children: any[], columns = 3, gap = 20) {
  return div(children, css({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gap + 'px',
  }));
}

export function flex(children: any[], direction = 'row', gap = 16, align?: string) {
  const style: Styles = { display: 'flex', flexDirection: direction, gap: gap + 'px' };
  if (align) style.alignItems = align;
  return div(children, css(style));
}

export function full(child: any) {
  return div([child], css({ width: '100%', height: '100%' }));
}

// DOM CREATION

export function createDOM(element: any): Node {
  if (element === null || element === undefined) return document.createTextNode('');
  if (typeof element === 'string' || typeof element === 'number') return document.createTextNode(String(element));
  if (typeof element !== 'object') return document.createTextNode('');

  if (Array.isArray(element)) {
    const frag = document.createDocumentFragment();
    element.forEach(child => { if (child != null) frag.appendChild(createDOM(child)); });
    return frag;
  }

  const { type, props = {}, children = [] } = element;
  if (!type) return document.createTextNode('');

  const el = document.createElement(type);

  if (props.className) el.className = props.className;
  if (props.id) el.id = props.id;

  if (props.style) {
    Object.entries(props.style).forEach(([key, val]) => {
      (el.style as any)[key] = val;
    });
  }

  if (props.on) {
    Object.entries(props.on).forEach(([eventName, handler]) => {
      el.addEventListener(eventName, handler as EventListener);
    });
  }

  Object.entries(props).forEach(([key, val]) => {
    if (/^\d+$/.test(key)) return;
    if (key.startsWith('data-') && val != null) el.setAttribute(key, String(val));
  });

  // Only set attributes if el is a valid Element node
  if (el.nodeType === 1) {
    const skip = ['className', 'id', 'style', 'on', 'children', 'key', ...Object.keys(props).filter(k => k.startsWith('data-'))];
    Object.entries(props).forEach(([key, val]) => {
      if (!skip.includes(key) && val != null && typeof key === 'string') {
        if (key === 'value' && (el as any).value !== undefined) (el as any).value = String(val);
        else if (key !== 'children' && key !== 'key') el.setAttribute(key, String(val));
      }
    });
  }

  children.forEach((child: any) => {
    if (child != null) el.appendChild(createDOM(child));
  });

  return el;
}

// CREATE APP

interface AppConfig {
  root: string | HTMLElement;
  state: any;
  render: (state: any) => any;
}

export function createApp(config: AppConfig) {
  const rootEl = typeof config.root === 'string'
    ? document.querySelector(config.root as string) as HTMLElement
    : config.root as HTMLElement;

  if (!rootEl) { console.error('NexusLite: Root element not found:', config.root); return; }

  // Detect if config.state is a Store instance (has getState method) or plain object
  const isStore = config.state && typeof (config.state as any).getState === 'function';
  
  // If it's a Store, use it directly; otherwise create a new Store from plain state
  const store = isStore
    ? (config.state as Store)
    : createStore(config.state as Record<string, any>);

  function render(state: any) {
    rootEl.innerHTML = '';
    const node = createDOM(config.render(state));
    if (node) rootEl.appendChild(node);
  }

  // Subscribe to store changes and re-render
  store.subscribe(render);
  
  // Initial render
  render(store.getState());
  
  return store;
}

// COMPONENT

export class Component {
  private el: HTMLElement | null = null;
  private _state: Record<string, any>;
  private renderFn: (state: any, props?: any) => any;
  private onMountFn?: (el: HTMLElement) => void;

  constructor(config: { render: (state: any, props?: any) => any; state?: any; onMount?: (el: HTMLElement) => void }) {
    this._state = config.state || {};
    this.renderFn = config.render;
    this.onMountFn = config.onMount;
  }

  mount(container: HTMLElement): HTMLElement {
    this.el = container;
    container.innerHTML = '';
    const node = createDOM(this.renderFn(this._state));
    if (node) container.appendChild(node);
    if (this.onMountFn && this.el) this.onMountFn(this.el);
    return container;
  }

  setState(newState: Record<string, any>) {
    this._state = { ...this._state, ...newState };
    if (this.el) this.mount(this.el);
  }

  getState() { return { ...this._state }; }
}

// STATE

type Subscriber = (state: any) => void;

export class Store {
  private state: Record<string, any>;
  private subscribers = new Set<Subscriber>();
  private listeners = new Map<string, Set<Subscriber>>();

  constructor(initialState: any = {}) {
    this.state = { ...initialState };
  }

  getState() { return { ...this.state }; }
  get<K extends keyof Record<string, any>>(key: K) { return this.state[key]; }

  setState(newState: Record<string, any>) {
    const prev = { ...this.state };
    this.state = { ...this.state, ...newState };
    this._notify(prev, newState);
  }

  set(key: string, value: any) {
    const prev = { ...this.state };
    this.state[key] = value;
    this._notify(prev, { [key]: value });
  }

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  on(key: string, fn: Subscriber) {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(fn);
    return () => this.listeners.get(key)?.delete(fn);
  }

  derive<T>(fn: (state: Record<string, any>) => T) { return fn(this.state); }

  private _notify(prev: Record<string, any>, changed: Record<string, any>) {
    this.subscribers.forEach(fn => fn(this.state));
    Object.keys(changed).forEach(key => this.listeners.get(key)?.forEach(fn => fn(this.state)));
  }
}

export function createStore(initialState?: any) { return new Store(initialState); }

// ROUTER

type RouteHandler = (params: Record<string, string>) => void;
type RouteFilter = (path: string) => boolean;

export class Router {
  private routes: { path: string; handler: RouteHandler }[] = [];
  private notFoundHandler?: RouteHandler;
  private beforeEachHandler?: RouteFilter;

  init() {
    window.addEventListener('hashchange', () => this._handle());
    this._handle();
  }

  route(path: string, handler: RouteHandler) { this.routes.push({ path, handler }); return this; }
  beforeEach(fn: RouteFilter) { this.beforeEachHandler = fn; return this; }
  notFound(fn: RouteHandler) { this.notFoundHandler = fn; return this; }
  navigate(path: string) { window.location.hash = path.startsWith('#') ? path : '#/' + path; }
  getPath() { return (window.location.hash || '#/').replace('#', '') || '/'; }

  private _handle() {
    const path = this.getPath();
    if (this.beforeEachHandler && !this.beforeEachHandler(path)) return;
    for (const route of this.routes) {
      const params = this._match(route.path, path);
      if (params) { route.handler(params); return; }
    }
    this.notFoundHandler?.({});
  }

  private _match(pattern: string, path: string) {
    const pp = pattern.split('/').filter(Boolean);
    const pc = path.split('/').filter(Boolean);
    if (pp.length !== pc.length) return null;
    const params: Record<string, string> = {};
    for (let i = 0; i < pp.length; i++) {
      if (pp[i].startsWith(':')) params[pp[i].slice(1)] = pc[i];
      else if (pp[i] !== pc[i]) return null;
    }
    return params;
  }
}

export function createRouter() { return new Router(); }

// HTTP

interface HttpOptions { method?: string; headers?: Record<string, string>; body?: any; }
interface HttpResponse<T = any> { data: T; status: number; }

export class HttpClient {
  private baseURL = '';
  constructor(baseURL = '') { this.baseURL = baseURL; }
  setBaseURL(url: string) { this.baseURL = url; return this; }

  async request<T = any>(endpoint: string, options: HttpOptions = {}): Promise<HttpResponse<T>> {
    const url = this.baseURL ? this.baseURL + endpoint : endpoint;
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    };
    if (options.body && config.method !== 'GET') config.body = JSON.stringify(options.body);
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);
    return { data: data as T, status: res.status };
  }

  get<T = any>(endpoint: string) { return this.request<T>(endpoint, { method: 'GET' }); }
  post<T = any>(endpoint: string, data?: any) { return this.request<T>(endpoint, { method: 'POST', body: data }); }
  put<T = any>(endpoint: string, data?: any) { return this.request<T>(endpoint, { method: 'PUT', body: data }); }
  delete<T = any>(endpoint: string) { return this.request<T>(endpoint, { method: 'DELETE' }); }
  patch<T = any>(endpoint: string, data?: any) { return this.request<T>(endpoint, { method: 'PATCH', body: data }); }
}

export function createHttp(baseURL?: string) { return new HttpClient(baseURL); }

// DRAG AND DROP

interface DragDropOptions {
  onDrop?: (draggedId: string, dropZoneId: string, event: Event) => void;
  draggableSelector?: string;
  dropZoneSelector?: string;
}

export class DragDropContainer {
  private container: HTMLElement;
  private activeDragId: string | null = null;
  private enabled = true;
  private options: {
    onDrop?: (draggedId: string, dropZoneId: string, event: Event) => void;
    draggableSelector: string;
    dropZoneSelector: string;
  };

  constructor(container: HTMLElement | string, options: DragDropOptions = {}) {
    const resolvedContainer = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement | null
      : container;

    this.options = {
      onDrop: options.onDrop,
      draggableSelector: options.draggableSelector || '[data-dnd-draggable]',
      dropZoneSelector: options.dropZoneSelector || '[data-dnd-dropzone]',
    };

    if (!resolvedContainer) {
      console.error('NexusLite: DragDrop container not found:', container);
      this.enabled = false;
      this.container = document.createElement('div');
      return;
    }

    this.container = resolvedContainer;
    this.container.addEventListener('dragstart', this.handleDragStart);
    this.container.addEventListener('dragover', this.handleDragOver);
    this.container.addEventListener('drop', this.handleDrop);
    this.container.addEventListener('dragend', this.handleDragEnd);
  }

  private resolveElement(target: EventTarget | null, selector: string): HTMLElement | null {
    if (!(target instanceof Element)) return null;
    const match = target.closest(selector);
    return match instanceof HTMLElement ? match : null;
  }

  private handleDragStart = (event: Event) => {
    if (!this.enabled) return;
    const source = this.resolveElement(event.target, this.options.draggableSelector);
    if (!source) return;

    const dragId = source.getAttribute('data-dnd-draggable');
    if (!dragId) return;

    this.activeDragId = dragId;

    const dragEvent = event as DragEvent;
    if (dragEvent.dataTransfer) {
      dragEvent.dataTransfer.effectAllowed = 'move';
      dragEvent.dataTransfer.setData('text/plain', dragId);
    }
  };

  private handleDragOver = (event: Event) => {
    if (!this.enabled) return;
    const dropZone = this.resolveElement(event.target, this.options.dropZoneSelector);
    if (!dropZone) return;

    event.preventDefault();

    const dragEvent = event as DragEvent;
    if (dragEvent.dataTransfer) {
      dragEvent.dataTransfer.dropEffect = 'move';
    }
  };

  private handleDrop = (event: Event) => {
    if (!this.enabled) return;
    const dropZone = this.resolveElement(event.target, this.options.dropZoneSelector);
    if (!dropZone) return;

    event.preventDefault();

    const dropZoneId = dropZone.getAttribute('data-dnd-dropzone');
    const dragEvent = event as DragEvent;
    const draggedId = this.activeDragId || dragEvent.dataTransfer?.getData('text/plain') || '';

    if (!draggedId || !dropZoneId) return;

    this.options.onDrop?.(draggedId, dropZoneId, event);
    this.activeDragId = null;
  };

  private handleDragEnd = () => {
    this.activeDragId = null;
  };

  destroy() {
    if (!this.enabled) return;
    this.container.removeEventListener('dragstart', this.handleDragStart);
    this.container.removeEventListener('dragover', this.handleDragOver);
    this.container.removeEventListener('drop', this.handleDrop);
    this.container.removeEventListener('dragend', this.handleDragEnd);
    this.activeDragId = null;
  }
}

export function createDragDropContainer(container: HTMLElement | string, options?: DragDropOptions) {
  return new DragDropContainer(container, options);
}

export function draggable(id: string, attrs: Attrs = {}) {
  return { ...attrs, draggable: true, 'data-dnd-draggable': id };
}

export function dropZone(id: string, attrs: Attrs = {}) {
  return { ...attrs, 'data-dnd-dropzone': id };
}

// LAZY

export class LazyContainer {
  private container: HTMLElement;
  private children: any[] = [];
  private observer: IntersectionObserver | null = null;
  private pending = new Set<number>();

  constructor(container: HTMLElement) {
    this.container = container;
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = (e.target as HTMLElement).dataset.index;
          if (idx !== undefined) this._render(parseInt(idx));
        }
      });
    }, { rootMargin: '100px', threshold: 0.1 });
  }

  setChildren(children: any[]) {
    this.children = children;
    this.container.innerHTML = '';
    this.pending.clear();
    children.forEach((_, i) => {
      const ph = document.createElement('div');
      ph.dataset.index = String(i);
      ph.style.minHeight = '50px';
      this.container.appendChild(ph);
      this.observer?.observe(ph);
      this.pending.add(i);
    });
  }

  private _render(index: number) {
    if (!this.pending.has(index)) return;
    const ph = this.container.querySelector(`[data-index="${index}"]`);
    if (!ph) return;
    const node = createDOM(this.children[index]);
    ph.replaceWith(node);
    this.observer?.unobserve(ph);
    this.pending.delete(index);
  }

  renderAll() { this.pending.forEach(i => this._render(i)); }
  destroy() { this.observer?.disconnect(); }
}

export function createLazyContainer(el: HTMLElement) { return new LazyContainer(el); }

// PATTERNS

export function card(title: string, body: any, actions?: { label: string; onClick: (e: Event) => void }[]) {
  return div([
    h2(title),
    typeof body === 'string' ? p(body) : body,
    actions ? div(actions.map(a => button(a.label, on('click', a.onClick))), cls('card-actions')) : null,
  ], cls('card'));
}

export function modal(title: string, content: any[], onClose?: () => void) {
  return div([
    div([h2(title), ...(Array.isArray(content) ? content : [content])], cls('modal-content')),
  ], {
    className: 'modal-overlay',
    on: onClose ? { click: (e: Event) => { if ((e.target as HTMLElement).classList.contains('modal-overlay')) onClose(); } } : undefined,
  });
}

export function navbar(brand: string, links: { label: string; href: string }[]) {
  return header([
    div([
      a(brand, { href: '/' }),
      nav(links.map(l => a(l.label, { href: l.href, className: 'nav-link' })), { className: 'nav-menu' }),
    ], cls('nav-inner')),
  ], cls('navbar'));
}

export function alert(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: '#d4edda', text: '#155724' },
    error: { bg: '#f8d7da', text: '#721c24' },
    warning: { bg: '#fff3cd', text: '#856404' },
    info: { bg: '#d1ecf1', text: '#0c5464' },
  };
  const c = colors[type];
  return div(message, css({ padding: '12px 16px', borderRadius: '8px', backgroundColor: c.bg, color: c.text }));
}

export function spinner(size = 24) {
  return div('', css({ width: size + 'px', height: size + 'px', border: '3px solid #f3f3f3', borderTop: '3px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }));
}

// DEFAULT EXPORT

export default {
  // Elements
  div, span, p, h1, h2, h3, h4, h5, h6, a, strong, em, small, blockquote, code, pre,
  button, input, textarea, select, option,
  ul, ol, li,
  img, video, audio,
  nav, header, footer, main, section, article, aside,
  form, label, fieldset, legend,
  br, hr, spacer,

  // Attributes
  cls, css, id, data, on, onMulti, href, ph, type, name, val, disabled, required, autofocus, readonly, checked,

  // Layout
  row, column, center, grid, flex, full,

  // Core
  h, createDOM,

  // App & State
  createApp, createStore, Store, Component,

  // Router
  createRouter, Router,

  // HTTP
  createHttp, HttpClient,

  // Drag and Drop
  createDragDropContainer, DragDropContainer, draggable, dropZone,

  // Lazy
  createLazyContainer, LazyContainer,

  // Patterns
  card, modal, navbar, alert, spinner,
};