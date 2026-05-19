/**
  NexusLite — A comfortable frontend framework
  
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
function isNexusLiteElement(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value) && typeof value.type === 'string');
}
function isPlainObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value) && !isNexusLiteElement(value) && !(value instanceof Node));
}
function isAttrsObject(value) {
    if (!isPlainObject(value))
        return false;
    const keys = Object.keys(value);
    if (keys.length === 0)
        return false;
    return keys.some((key) => key === 'className' ||
        key === 'style' ||
        key === 'id' ||
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
        key.startsWith('aria-'));
}
function isAttrsArray(value) {
    return Array.isArray(value) && value.length > 0 && value.every((item) => isAttrsObject(item));
}
function mergeAttrs(...sources) {
    const result = {};
    for (const source of sources) {
        if (!source)
            continue;
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
function normalizeElementArgs(contentOrAttrs, attrsOrContent) {
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
export function h(type, props = {}, ...children) {
    return {
        type,
        props: { ...props },
        children: flattenChildren(children),
        key: props.key || undefined,
    };
}
function flattenChildren(children) {
    const result = [];
    for (const child of children) {
        if (child === null || child === undefined)
            continue;
        if (Array.isArray(child)) {
            result.push(...flattenChildren(child));
        }
        else if (typeof child !== 'boolean') {
            result.push(child);
        }
    }
    return result;
}
// ELEMENT FUNCTIONS (PRIMARY API)
function el(tag, content, attrs) {
    const { content: normalizedContent, attrs: normalizedAttrs } = normalizeElementArgs(content, attrs);
    if (normalizedContent === undefined)
        return h(tag, normalizedAttrs || {});
    if (typeof normalizedContent === 'string' || typeof normalizedContent === 'number')
        return h(tag, normalizedAttrs || {}, normalizedContent);
    if (Array.isArray(normalizedContent))
        return h(tag, normalizedAttrs || {}, ...normalizedContent);
    if (isNexusLiteElement(normalizedContent))
        return h(tag, normalizedAttrs || {}, normalizedContent);
    return h(tag, normalizedAttrs || {});
}
// Block elements
export function div(content, attrs) { return el('div', content, attrs); }
export function span(content, attrs) { return el('span', content, attrs); }
export function p(content, attrs) { return el('p', content, attrs); }
export function h1(content, attrs) { return el('h1', content, attrs); }
export function h2(content, attrs) { return el('h2', content, attrs); }
export function h3(content, attrs) { return el('h3', content, attrs); }
export function h4(content, attrs) { return el('h4', content, attrs); }
export function h5(content, attrs) { return el('h5', content, attrs); }
export function h6(content, attrs) { return el('h6', content, attrs); }
export function a(content, attrs) { return el('a', content, attrs); }
export function strong(content, attrs) { return el('strong', content, attrs); }
export function em(content, attrs) { return el('em', content, attrs); }
export function small(content, attrs) { return el('small', content, attrs); }
export function blockquote(content, attrs) { return el('blockquote', content, attrs); }
export function code(content, attrs) { return el('code', content, attrs); }
export function pre(content, attrs) { return el('pre', content, attrs); }
// Interactive elements
export function button(content, attrs) { return el('button', content, attrs); }
export function input(attrs) { return h('input', attrs || {}); }
export function textarea(content, attrs) { return el('textarea', content, attrs); }
export function select(children, attrs) { return el('select', children, attrs); }
export function option(label, value, attrs) { return el('option', label, { value, ...attrs }); }
// Lists
export function ul(items, attrs) { return el('ul', items?.map ? items.map((item) => li(item)) : items, attrs); }
export function ol(items, attrs) { return el('ol', items?.map ? items.map((item) => li(item)) : items, attrs); }
export function li(content, attrs) { return el('li', content, attrs); }
// Media
export function img(src, attrs) { return h('img', { src, ...attrs }); }
export function video(attrs) { return h('video', attrs || {}); }
export function audio(attrs) { return h('audio', attrs || {}); }
// Structure
export function nav(children, attrs) { return el('nav', children, attrs); }
export function header(children, attrs) { return el('header', children, attrs); }
export function footer(children, attrs) { return el('footer', children, attrs); }
export function main(children, attrs) { return el('main', children, attrs); }
export function section(children, attrs) { return el('section', children, attrs); }
export function article(children, attrs) { return el('article', children, attrs); }
export function aside(children, attrs) { return el('aside', children, attrs); }
// Form elements
export function form(children, attrs) { return el('form', children, attrs); }
export function label(content, attrs) { return el('label', content, attrs); }
export function fieldset(children, attrs) { return el('fieldset', children, attrs); }
export function legend(content, attrs) { return el('legend', content, attrs); }
// Other
export function br() { return h('br', {}); }
export function hr(attrs) { return h('hr', attrs || {}); }
export function spacer(size = 16) { return div('', css({ height: size + 'px' })); }
// ATTRIBUTE HELPERS
export function cls(...names) { return { className: names.join(' ') }; }
export function css(styles) { return { style: styles }; }
export function id(name) { return { id: name }; }
export function data(key, value) { return { ['data-' + key]: value }; }
export function on(event, handler) { return { on: { [event]: handler } }; }
export function onMulti(events) { return { on: events }; }
export function href(url, target) { return target ? { href: url, target } : { href: url }; }
export function ph(text) { return { placeholder: text }; }
export function type(t) { return { type: t }; }
export function name(n) { return { name: n }; }
export function val(v) { return { value: v }; }
export function disabled() { return { disabled: true }; }
export function required() { return { required: true }; }
export function autofocus() { return { autofocus: true }; }
export function readonly() { return { readOnly: true }; }
export function checked() { return { checked: true }; }
// LAYOUT HELPERS
export function row(children, gap = 16) {
    return div(children, css({ display: 'flex', gap: gap + 'px', alignItems: 'center' }));
}
export function column(children, gap = 16) {
    return div(children, css({ display: 'flex', flexDirection: 'column', gap: gap + 'px' }));
}
export function center(children, maxWidth = 1200) {
    return div(children, css({ maxWidth: maxWidth + 'px', margin: '0 auto', padding: '0 20px' }));
}
export function grid(children, columns = 3, gap = 20) {
    return div(children, css({
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap + 'px',
    }));
}
export function flex(children, direction = 'row', gap = 16, align) {
    const style = { display: 'flex', flexDirection: direction, gap: gap + 'px' };
    if (align)
        style.alignItems = align;
    return div(children, css(style));
}
export function full(child) {
    return div([child], css({ width: '100%', height: '100%' }));
}
// DOM CREATION
export function createDOM(element) {
    if (element === null || element === undefined)
        return document.createTextNode('');
    if (typeof element === 'string' || typeof element === 'number')
        return document.createTextNode(String(element));
    if (typeof element !== 'object')
        return document.createTextNode('');
    if (Array.isArray(element)) {
        const frag = document.createDocumentFragment();
        element.forEach(child => { if (child != null)
            frag.appendChild(createDOM(child)); });
        return frag;
    }
    const { type, props = {}, children = [] } = element;
    if (!type)
        return document.createTextNode('');
    const el = document.createElement(type);
    if (props.className)
        el.className = props.className;
    if (props.id)
        el.id = props.id;
    if (props.style) {
        Object.entries(props.style).forEach(([key, val]) => {
            el.style[key] = val;
        });
    }
    if (props.on) {
        Object.entries(props.on).forEach(([eventName, handler]) => {
            el.addEventListener(eventName, handler);
        });
    }
    Object.entries(props).forEach(([key, val]) => {
        if (/^\d+$/.test(key))
            return;
        if (key.startsWith('data-') && val != null)
            el.setAttribute(key, String(val));
    });
    // Only set attributes if el is a valid Element node
    if (el.nodeType === 1) {
        const skip = ['className', 'id', 'style', 'on', 'children', 'key', ...Object.keys(props).filter(k => k.startsWith('data-'))];
        Object.entries(props).forEach(([key, val]) => {
            if (!skip.includes(key) && val != null && typeof key === 'string') {
                if (key === 'value' && el.value !== undefined)
                    el.value = String(val);
                else if (key !== 'children' && key !== 'key')
                    el.setAttribute(key, String(val));
            }
        });
    }
    children.forEach((child) => {
        if (child != null)
            el.appendChild(createDOM(child));
    });
    return el;
}
export function createApp(config) {
    const rootEl = typeof config.root === 'string'
        ? document.querySelector(config.root)
        : config.root;
    if (!rootEl) {
        console.error('NexusLite: Root element not found:', config.root);
        return;
    }
    // Detect if config.state is a Store instance (has getState method) or plain object
    const isStore = config.state && typeof config.state.getState === 'function';
    // If it's a Store, use it directly; otherwise create a new Store from plain state
    const store = isStore
        ? config.state
        : createStore(config.state);
    function render(state) {
        rootEl.innerHTML = '';
        const node = createDOM(config.render(state));
        if (node)
            rootEl.appendChild(node);
    }
    // Subscribe to store changes and re-render
    store.subscribe(render);
    // Initial render
    render(store.getState());
    return store;
}
// COMPONENT
export class Component {
    constructor(config) {
        this.el = null;
        this._state = config.state || {};
        this.renderFn = config.render;
        this.onMountFn = config.onMount;
    }
    mount(container) {
        this.el = container;
        container.innerHTML = '';
        const node = createDOM(this.renderFn(this._state));
        if (node)
            container.appendChild(node);
        if (this.onMountFn && this.el)
            this.onMountFn(this.el);
        return container;
    }
    setState(newState) {
        this._state = { ...this._state, ...newState };
        if (this.el)
            this.mount(this.el);
    }
    getState() { return { ...this._state }; }
}
export class Store {
    constructor(initialState = {}) {
        this.subscribers = new Set();
        this.listeners = new Map();
        this.state = { ...initialState };
    }
    getState() { return { ...this.state }; }
    get(key) { return this.state[key]; }
    setState(newState) {
        const prev = { ...this.state };
        this.state = { ...this.state, ...newState };
        this._notify(prev, newState);
    }
    set(key, value) {
        const prev = { ...this.state };
        this.state[key] = value;
        this._notify(prev, { [key]: value });
    }
    subscribe(fn) {
        this.subscribers.add(fn);
        return () => this.subscribers.delete(fn);
    }
    on(key, fn) {
        if (!this.listeners.has(key))
            this.listeners.set(key, new Set());
        this.listeners.get(key).add(fn);
        return () => this.listeners.get(key)?.delete(fn);
    }
    derive(fn) { return fn(this.state); }
    _notify(prev, changed) {
        this.subscribers.forEach(fn => fn(this.state));
        Object.keys(changed).forEach(key => this.listeners.get(key)?.forEach(fn => fn(this.state)));
    }
}
export function createStore(initialState) { return new Store(initialState); }
export class Router {
    constructor() {
        this.routes = [];
    }
    init() {
        window.addEventListener('hashchange', () => this._handle());
        this._handle();
    }
    route(path, handler) { this.routes.push({ path, handler }); return this; }
    beforeEach(fn) { this.beforeEachHandler = fn; return this; }
    notFound(fn) { this.notFoundHandler = fn; return this; }
    navigate(path) { window.location.hash = path.startsWith('#') ? path : '#/' + path; }
    getPath() { return (window.location.hash || '#/').replace('#', '') || '/'; }
    _handle() {
        const path = this.getPath();
        if (this.beforeEachHandler && !this.beforeEachHandler(path))
            return;
        for (const route of this.routes) {
            const params = this._match(route.path, path);
            if (params) {
                route.handler(params);
                return;
            }
        }
        this.notFoundHandler?.({});
    }
    _match(pattern, path) {
        const pp = pattern.split('/').filter(Boolean);
        const pc = path.split('/').filter(Boolean);
        if (pp.length !== pc.length)
            return null;
        const params = {};
        for (let i = 0; i < pp.length; i++) {
            if (pp[i].startsWith(':'))
                params[pp[i].slice(1)] = pc[i];
            else if (pp[i] !== pc[i])
                return null;
        }
        return params;
    }
}
export function createRouter() { return new Router(); }
export class HttpClient {
    constructor(baseURL = '') {
        this.baseURL = '';
        this.baseURL = baseURL;
    }
    setBaseURL(url) { this.baseURL = url; return this; }
    async request(endpoint, options = {}) {
        const url = this.baseURL ? this.baseURL + endpoint : endpoint;
        const config = {
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json', ...options.headers },
        };
        if (options.body && config.method !== 'GET')
            config.body = JSON.stringify(options.body);
        const res = await fetch(url, config);
        const data = await res.json().catch(() => null);
        return { data: data, status: res.status };
    }
    get(endpoint) { return this.request(endpoint, { method: 'GET' }); }
    post(endpoint, data) { return this.request(endpoint, { method: 'POST', body: data }); }
    put(endpoint, data) { return this.request(endpoint, { method: 'PUT', body: data }); }
    delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
    patch(endpoint, data) { return this.request(endpoint, { method: 'PATCH', body: data }); }
}
export function createHttp(baseURL) { return new HttpClient(baseURL); }
// LAZY
export class LazyContainer {
    constructor(container) {
        this.children = [];
        this.observer = null;
        this.pending = new Set();
        this.container = container;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const idx = e.target.dataset.index;
                    if (idx !== undefined)
                        this._render(parseInt(idx));
                }
            });
        }, { rootMargin: '100px', threshold: 0.1 });
    }
    setChildren(children) {
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
    _render(index) {
        if (!this.pending.has(index))
            return;
        const ph = this.container.querySelector(`[data-index="${index}"]`);
        if (!ph)
            return;
        const node = createDOM(this.children[index]);
        ph.replaceWith(node);
        this.observer?.unobserve(ph);
        this.pending.delete(index);
    }
    renderAll() { this.pending.forEach(i => this._render(i)); }
    destroy() { this.observer?.disconnect(); }
}
export function createLazyContainer(el) { return new LazyContainer(el); }
// PATTERNS
export function card(title, body, actions) {
    return div([
        h2(title),
        typeof body === 'string' ? p(body) : body,
        actions ? div(actions.map(a => button(a.label, on('click', a.onClick))), cls('card-actions')) : null,
    ], cls('card'));
}
export function modal(title, content, onClose) {
    return div([
        div([h2(title), ...(Array.isArray(content) ? content : [content])], cls('modal-content')),
    ], {
        className: 'modal-overlay',
        on: onClose ? { click: (e) => { if (e.target.classList.contains('modal-overlay'))
                onClose(); } } : undefined,
    });
}
export function navbar(brand, links) {
    return header([
        div([
            a(brand, { href: '/' }),
            nav(links.map(l => a(l.label, { href: l.href, className: 'nav-link' })), { className: 'nav-menu' }),
        ], cls('nav-inner')),
    ], cls('navbar'));
}
export function alert(message, type = 'info') {
    const colors = {
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
    // Lazy
    createLazyContainer, LazyContainer,
    // Patterns
    card, modal, navbar, alert, spinner,
};
