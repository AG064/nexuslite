import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  h, div, span, p, h1, h2, h3, button, input, br, createDOM, renderToString,
  ul, ol, li, img, form, label, select, option, main, mainEl,
  cls, css, id, data, on, onMulti, delegate, href, ph, type, inputType, name, val,
  disabled, required, autofocus, readonly, checked, bindTo,
  row, column, center, grid, flex, full,
  createStore, createApp, Component, Store, mount,
  createRouter, Router, make404Html,
  createHttp, HttpClient, HttpError,
  createDragDropContainer, draggable, dropZone,
  createLazyContainer, LazyContainer,
  card, modal, navbar, alert, spinner,
} from './nexuslite';

// SETUP

beforeEach(() => {
  document.body.innerHTML = '';
  // jsdom doesn't ship IntersectionObserver. Stub it for the LazyContainer tests.
  if (typeof (globalThis as any).IntersectionObserver === 'undefined') {
    class StubIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
      root = null;
      rootMargin = '';
      thresholds = [];
    }
    (globalThis as any).IntersectionObserver = StubIntersectionObserver;
  }
});

// CREATE DOM TESTS

describe('createDOM', () => {
  it('creates text node for string', () => {
    const node = createDOM('hello');
    expect(node.nodeType).toBe(Node.TEXT_NODE);
    expect(node.textContent).toBe('hello');
  });

  it('creates text node for number', () => {
    const node = createDOM(42);
    expect(node.nodeType).toBe(Node.TEXT_NODE);
    expect(node.textContent).toBe('42');
  });

  it('creates empty text node for null', () => {
    const node = createDOM(null);
    expect(node.nodeType).toBe(Node.TEXT_NODE);
    expect(node.textContent).toBe('');
  });

  it('creates empty text node for undefined', () => {
    const node = createDOM(undefined);
    expect(node.nodeType).toBe(Node.TEXT_NODE);
    expect(node.textContent).toBe('');
  });

  it('creates element node with correct tag', () => {
    const node = createDOM(h('div', {}, 'test'));
    expect(node.nodeType).toBe(Node.ELEMENT_NODE);
    expect((node as Element).tagName).toBe('DIV');
  });

  it('handles array of elements', () => {
    const node = createDOM([
      h('div', {}, 'a'),
      h('span', {}, 'b'),
    ]);
    expect(node.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
    expect((node as DocumentFragment).childNodes.length).toBe(2);
  });

  it('skips null/undefined in arrays', () => {
    const frag = createDOM([
      h('div', {}, 'a'),
      null,
      undefined,
      h('span', {}, 'b'),
    ]) as DocumentFragment;
    expect(frag.childNodes.length).toBe(2);
  });

  it('sets className correctly', () => {
    const node = createDOM(h('div', { className: 'foo bar' }));
    expect((node as Element).className).toBe('foo bar');
  });

  it('sets id correctly', () => {
    const node = createDOM(h('div', { id: 'my-id' }));
    expect((node as Element).id).toBe('my-id');
  });

  it('sets data attributes', () => {
    const node = createDOM(h('div', { 'data-user-id': '123' }));
    expect((node as Element).getAttribute('data-user-id')).toBe('123');
  });

  it('attaches event listeners', () => {
    const handler = vi.fn();
    const el = h('button', { on: { click: handler } });
    const node = createDOM(el);
    (node as Element).dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('sets inline styles', () => {
    const node = createDOM(h('div', { style: { color: 'red', fontSize: '14px' } }));
    const style = (node as Element).style;
    expect(style.color).toBe('red');
    expect(style.fontSize).toBe('14px');
  });

  it('sets form element value', () => {
    const node = createDOM(h('input', { value: 'test value' }));
    expect((node as HTMLInputElement).value).toBe('test value');
  });

  it('appends children correctly', () => {
    const node = createDOM(h('div', {}, h('span', {}, 'child')));
    const el = node as Element;
    expect(el.children.length).toBe(1);
    expect(el.firstElementChild?.tagName).toBe('SPAN');
  });

  it('only sets attributes on element nodes (not text nodes)', () => {
    // This was the bug fix - text nodes don't have setAttribute
    const parent = h('div', {}, 'text node');
    const node = createDOM(parent);
    expect(node.nodeType).toBe(Node.ELEMENT_NODE);
    expect((node as Element).childNodes[0].nodeType).toBe(Node.TEXT_NODE);
  });
});

// ELEMENT FACTORY TESTS

describe('Elements', () => {
  it('div creates div element', () => {
    const el = div();
    expect(el.type).toBe('div');
  });

  it('div with content', () => {
    const el = div('Hello');
    expect(el.children[0]).toBe('Hello');
  });

  it('div with children array', () => {
    const el = div([h1('Title'), p('Text')]);
    expect(el.children.length).toBe(2);
  });

  it('h1-h6 creates correct tags', () => {
    expect(h1().type).toBe('h1');
    expect(h2().type).toBe('h2');
  });

  it('button creates button element', () => {
    const el = button('Click me');
    expect(el.type).toBe('button');
    expect(el.children[0]).toBe('Click me');
  });

  it('input creates input element', () => {
    const el = input({ type: 'text', placeholder: 'Enter name' });
    expect(el.type).toBe('input');
    expect(el.props.type).toBe('text');
    expect(el.props.placeholder).toBe('Enter name');
  });

  it('ul/ol creates list with items', () => {
    const ulEl = ul(['item1', 'item2']);
    expect(ulEl.type).toBe('ul');
    expect(ulEl.children.length).toBe(2);
    expect((ulEl.children[0] as any).type).toBe('li');

    const olEl = ol(['a', 'b']);
    expect(olEl.type).toBe('ol');
    expect(olEl.children.length).toBe(2);
  });

  it('img creates img with src', () => {
    const el = img('https://example.com/image.png', { alt: 'Test' });
    expect(el.type).toBe('img');
    expect(el.props.src).toBe('https://example.com/image.png');
    expect(el.props.alt).toBe('Test');
  });

  it('form elements work', () => {
    const f = form([input()]);
    expect(f.type).toBe('form');

    const l = label('Name');
    expect(l.type).toBe('label');

    const sel = select([option('A', 'a'), option('B', 'b')]);
    expect(sel.type).toBe('select');
    expect(sel.children.length).toBe(2);
  });

  it('el(tag, text, childElement) keeps the child element as a sibling, not as attrs', () => {
    // Regression: previously the second non-attrs arg was treated as attrs
    // and dropped. So `label("Name", input({...}))` rendered as a label
    // containing only "Name" with the input lost. Now both should be
    // children of the label.
    const l = label('Your name', input({ name: 'name' }));
    expect(l.type).toBe('label');
    expect(l.children.length).toBe(2);
    expect(l.children[0]).toBe('Your name');
    expect((l.children[1] as any).type).toBe('input');
    expect((l.children[1] as any).props.name).toBe('name');

    // Two sibling elements also work
    const labelWithTwoKids = p(span('left'), span('right'));
    expect(labelWithTwoKids.children.length).toBe(2);
    expect((labelWithTwoKids.children[0] as any).type).toBe('span');
    expect((labelWithTwoKids.children[1] as any).type).toBe('span');
  });
});

// ATTRIBUTE HELPER TESTS

describe('Attribute Helpers', () => {
  it('cls joins class names', () => {
    const result = cls('btn', 'btn-primary');
    expect(result.className).toBe('btn btn-primary');
  });

  it('cls filters out falsy values', () => {
    expect(cls('btn', false && 'btn-primary').className).toBe('btn');
    expect(cls('a', null, 'b').className).toBe('a b');
    expect(cls('a', undefined, 'b').className).toBe('a b');
    expect(cls('a', '', 'b').className).toBe('a b');
    expect(cls('a', false, null, undefined, 'b').className).toBe('a b');
  });

  it('cls supports conditional class names with &&', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cls('btn', isActive && 'btn--active', isDisabled && 'btn--disabled').className)
      .toBe('btn btn--active');
  });

  it('inputType is an alias for type', () => {
    expect(inputType('email')).toEqual({ type: 'email' });
    expect(inputType('checkbox')).toEqual({ type: 'checkbox' });
    // The two functions should produce the same output
    expect(inputType('text')).toEqual(type('text'));
  });

  it('delegate fires for matching children, not for the root itself', () => {
    document.body.innerHTML = '<div id="root"><button data-action="x">x</button><span data-action="y">y</span></div>';
    const root = document.getElementById('root')!;
    const handler = vi.fn();
    const off = delegate(root, 'click', '[data-action]', (e, target) => {
      handler(target.dataset.action);
    });
    root.querySelector('[data-action="x"]')!.dispatchEvent(new Event('click', { bubbles: true }));
    root.querySelector('[data-action="y"]')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, 'x');
    expect(handler).toHaveBeenNthCalledWith(2, 'y');
    off();
    root.querySelector('[data-action="x"]')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(2); // off() worked
  });

  it('delegate ignores events that do not match the selector', () => {
    document.body.innerHTML = '<div id="root"><span>plain</span><button data-x>x</button></div>';
    const root = document.getElementById('root')!;
    const handler = vi.fn();
    const off = delegate(root, 'click', '[data-x]', () => handler());
    root.querySelector('span')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
    off();
  });

  it('delegate returns an unsubscribe function', () => {
    document.body.innerHTML = '<div id="root"><button data-x>x</button></div>';
    const root = document.getElementById('root')!;
    const handler = vi.fn();
    const off = delegate(root, 'click', '[data-x]', () => handler());
    expect(typeof off).toBe('function');
    off();
    root.querySelector('[data-x]')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('bindTo returns value and on handler that sync to a store', () => {
    const store = createStore<{ name: string }>({ name: 'Alice' });
    const binding = bindTo(store, 'name');
    expect(binding.value).toBe('Alice');
    expect(binding.on).toBeDefined();
    expect(typeof binding.on.input).toBe('function');

    // Simulate user typing
    const fakeEvent = { target: { value: 'Bob' } } as unknown as Event;
    binding.on.input(fakeEvent);
    expect(store.get('name')).toBe('Bob');

    // In a render function, bindTo() is called again to get the fresh value
    const refreshed = bindTo(store, 'name');
    expect(refreshed.value).toBe('Bob');
  });

  it('bindTo with transform converts the value', () => {
    const store = createStore<{ count: number }>({ count: 0 });
    const binding = bindTo(store, 'count', (v) => Number(v));
    expect(binding.value).toBe('0');

    const fakeEvent = { target: { value: '42' } } as unknown as Event;
    binding.on.input(fakeEvent);
    expect(store.get('count')).toBe(42);
  });

  it('bindTo handles null/undefined initial values', () => {
    const store = createStore<{ name: string | null }>({ name: null });
    const binding = bindTo(store, 'name');
    expect(binding.value).toBe('');
  });

  it('css creates style object', () => {
    const result = css({ color: 'blue', padding: '10px' });
    expect(result.style).toEqual({ color: 'blue', padding: '10px' });
  });

  it('id creates id object', () => {
    expect(id('test')).toEqual({ id: 'test' });
  });

  it('data creates data attribute', () => {
    expect(data('userId', '123')).toEqual({ 'data-userId': '123' });
  });

  it('on creates event handler object', () => {
    const handler = () => {};
    const result = on('click', handler);
    expect(result.on).toEqual({ click: handler });
  });

  it('onMulti creates multiple handlers', () => {
    const fn1 = () => {};
    const fn2 = () => {};
    const result = onMulti({ click: fn1, mouseenter: fn2 });
    expect(result.on).toEqual({ click: fn1, mouseenter: fn2 });
  });

  it('href creates href', () => {
    expect(href('https://example.com')).toEqual({ href: 'https://example.com' });
    expect(href('https://example.com', '_blank')).toEqual({ href: 'https://example.com', target: '_blank' });
  });

  it('ph creates placeholder', () => {
    expect(ph('Enter text...')).toEqual({ placeholder: 'Enter text...' });
  });

  it('type creates type attribute', () => {
    expect(type('email')).toEqual({ type: 'email' });
  });

  it('name creates name attribute', () => {
    expect(name('username')).toEqual({ name: 'username' });
  });

  it('val creates value attribute', () => {
    expect(val('test')).toEqual({ value: 'test' });
    expect(val(42)).toEqual({ value: 42 });
  });

  it('disabled creates disabled attribute', () => {
    expect(disabled()).toEqual({ disabled: true });
  });

  it('required creates required attribute', () => {
    expect(required()).toEqual({ required: true });
  });

  it('autofocus creates autofocus attribute', () => {
    expect(autofocus()).toEqual({ autofocus: true });
  });

  it('readonly creates readOnly attribute', () => {
    expect(readonly()).toEqual({ readOnly: true });
  });

  it('checked creates checked attribute', () => {
    expect(checked()).toEqual({ checked: true });
  });

  it('draggable helper marks elements as draggable', () => {
    expect(draggable('task-1')).toEqual({ draggable: true, 'data-dnd-draggable': 'task-1' });
  });

  it('dropZone helper marks drop targets', () => {
    expect(dropZone('column-a')).toEqual({ 'data-dnd-dropzone': 'column-a' });
  });
});

// LAYOUT HELPER TESTS

describe('Layout Helpers', () => {
  it('row creates flex container', () => {
    const el = row([div(), div()]);
    expect(el.type).toBe('div');
    expect(el.props.style.display).toBe('flex');
    expect(el.props.style.gap).toBe('16px');
    expect(el.props.style.alignItems).toBe('center');
  });

  it('row with custom gap', () => {
    const el = row([div()], 24);
    expect(el.props.style.gap).toBe('24px');
  });

  it('column creates column flex', () => {
    const el = column([div(), div()]);
    expect(el.props.style).toMatchObject({ display: 'flex', flexDirection: 'column' });
  });

  it('center creates centered container', () => {
    const el = center([div()], 800);
    expect(el.props.style.maxWidth).toBe('800px');
    expect(el.props.style.margin).toBe('0 auto');
  });

  it('grid creates grid layout', () => {
    const el = grid([div(), div(), div()], 3, 20);
    expect(el.props.style).toMatchObject({
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
    });
  });

  it('flex with direction', () => {
    const el = flex([div()], 'column', 8, 'stretch');
    expect(el.props.style).toMatchObject({
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'stretch',
    });
  });

  it('full creates 100% container', () => {
    const el = full(div());
    expect(el.props.style).toMatchObject({ width: '100%', height: '100%' });
  });
});

// STORE TESTS

describe('createStore', () => {
  it('creates store with initial state', () => {
    const store = createStore({ count: 0, name: 'test' });
    expect(store.getState()).toEqual({ count: 0, name: 'test' });
  });

  it('has getState method', () => {
    const store = createStore({ count: 0 });
    expect(typeof store.getState).toBe('function');
  });

  it('has setState method', () => {
    const store = createStore({ count: 0 });
    expect(typeof store.setState).toBe('function');
  });

  it('has subscribe method', () => {
    const store = createStore({ count: 0 });
    expect(typeof store.subscribe).toBe('function');
  });

  it('setState updates state', () => {
    const store = createStore({ count: 0 });
    store.setState({ count: 1 });
    expect(store.getState().count).toBe(1);
  });

  it('setState merges state', () => {
    const store = createStore({ count: 0, name: 'test' });
    store.setState({ count: 5 });
    expect(store.getState()).toEqual({ count: 5, name: 'test' });
  });

  it('subscribe notifies on change', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledWith({ count: 1 });
  });

  it('subscribe returns unsubscribe function', () => {
    const store = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('multiple subscribers', () => {
    const store = createStore({ count: 0 });
    const l1 = vi.fn();
    const l2 = vi.fn();
    store.subscribe(l1);
    store.subscribe(l2);
    store.setState({ count: 1 });
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });
});

// HTTP CLIENT

describe('createHttp', () => {
  // jsdom doesn't ship fetch by default; stub it for these tests.
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    // @ts-ignore
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('builds URL with query params', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({ id: 1 }),
    });
    const http = createHttp('https://api.example.com');
    await http.get('/users', { params: { id: 42, name: 'AG' } });
    const calledWith = (globalThis.fetch as any).mock.calls[0][0];
    expect(calledWith).toBe('https://api.example.com/users?id=42&name=AG');
  });

  it('appends params to a URL that already has a query string', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true, status: 200, headers: new Headers(),
      json: async () => ({}),
    });
    const http = createHttp('https://api.example.com');
    await http.get('/users?active=true', { params: { limit: 10 } });
    const calledWith = (globalThis.fetch as any).mock.calls[0][0];
    expect(calledWith).toBe('https://api.example.com/users?active=true&limit=10');
  });

  it('returns ok=true, status, and headers for 2xx', async () => {
    const headers = new Headers({ 'content-type': 'application/json' });
    (globalThis.fetch as any).mockResolvedValue({
      ok: true, status: 200, headers,
      json: async () => ({ name: 'AG' }),
    });
    const http = createHttp();
    const res = await http.get<{ name: string }>('/me');
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ name: 'AG' });
    expect(res.headers).toBe(headers);
  });

  it('returns ok=false for 4xx (no throw, just ok=false)', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false, status: 404, headers: new Headers(),
      json: async () => ({ error: 'not found' }),
    });
    const http = createHttp();
    const res = await http.get('/missing');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
  });

  it('does not auto-JSON the body when json: false', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true, status: 200, headers: new Headers(),
      json: async () => ({}),
    });
    const formData = new FormData();
    formData.append('name', 'AG');
    const http = createHttp();
    await http.post('/upload', formData, { json: false });
    const callArgs = (globalThis.fetch as any).mock.calls[0][1];
    expect(callArgs.body).toBe(formData);
    // Content-Type should NOT be set to application/json
    expect(callArgs.headers?.['Content-Type']).toBeUndefined();
  });

  it('aborts the request on timeout', async () => {
    // fetch that respects the abort signal
    (globalThis.fetch as any).mockImplementation((url: string, init: RequestInit) => {
      return new Promise((resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          const err: any = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
        // never resolve otherwise
      });
    });
    const http = createHttp();
    await expect(http.get('/slow', { timeout: 50 })).rejects.toThrow();
  });
});

// TYPED STORE (generic)

interface CounterState { count: number; step: number; label: string; }

describe('createStore (generic)', () => {
  it('preserves the type parameter on getState', () => {
    const store = createStore<CounterState>({ count: 0, step: 1, label: 'clicks' });
    const state: CounterState = store.getState();
    expect(state.count).toBe(0);
    expect(state.step).toBe(1);
    expect(state.label).toBe('clicks');
  });

  it('preserves the type parameter on get', () => {
    const store = createStore<CounterState>({ count: 5, step: 2, label: 'x' });
    const count: number = store.get('count');
    const label: string = store.get('label');
    expect(count).toBe(5);
    expect(label).toBe('x');
  });

  it('accepts partial state in setState', () => {
    const store = createStore<CounterState>({ count: 0, step: 1, label: 'clicks' });
    store.setState({ count: 5 });
    expect(store.getState()).toEqual({ count: 5, step: 1, label: 'clicks' });
  });

  it('accepts typed values in set', () => {
    const store = createStore<CounterState>({ count: 0, step: 1, label: 'clicks' });
    store.set('count', 10);
    store.set('label', 'updated');
    expect(store.getState()).toEqual({ count: 10, step: 1, label: 'updated' });
  });

  it('works without an explicit type parameter (defaults to Record<string, any>)', () => {
    const store = createStore({ x: 1 });
    store.setState({ y: 2 });
    expect(store.getState()).toEqual({ x: 1, y: 2 });
  });
});

// CREATE APP TESTS (INTEGRATION)

describe('createApp', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('renders initial state', () => {
    const store = createStore({ count: 0 });
    createApp({
      root: '#app',
      state: store,
      render: (s) => div([h1(`Count: ${s.count}`)]),
    });
    expect(document.getElementById('app').innerHTML).toContain('Count: 0');
  });

  it('re-renders on state change', () => {
    const store = createStore({ count: 0 });
    createApp({
      root: '#app',
      state: store,
      render: (s) => div([h1(`Count: ${s.count}`)]),
    });
    
    store.setState({ count: 5 });
    expect(document.getElementById('app').innerHTML).toContain('Count: 5');
  });

  it('accepts HTMLElement as root', () => {
    const store = createStore({ msg: 'hello' });
    const rootEl = document.getElementById('app');
    createApp({
      root: rootEl,
      state: store,
      render: (s) => div(s.msg),
    });
    expect(rootEl.innerHTML).toContain('hello');
  });

  it('handles plain object state', () => {
    // Duck-typing check - plain object without getState should work
    const plainState = { count: 0 };
    createApp({
      root: '#app',
      state: plainState,
      render: (s) => div([h1(`${s.count}`)]),
    });
    expect(document.getElementById('app').innerHTML).toContain('0');
  });
});

// DRAG AND DROP TESTS

describe('createDragDropContainer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="board">
        <div id="item" data-dnd-draggable="task-1" draggable="true">Item</div>
        <div id="zone" data-dnd-dropzone="column-1">Zone</div>
      </div>
    `;
  });

  it('delegates drag start and drop events by data attributes', () => {
    const onDrop = vi.fn();
    createDragDropContainer(document.getElementById('board') as HTMLElement, { onDrop });

    document.getElementById('item')!.dispatchEvent(new Event('dragstart', { bubbles: true, cancelable: true }));
    document.getElementById('zone')!.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    document.getElementById('zone')!.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));

    expect(onDrop).toHaveBeenCalledWith('task-1', 'column-1', expect.any(Event));
  });
});

// RUN TESTS

const runner = async () => {
  const { run } = await import('vitest');
  await run();
};

export { runner };

// ROUTER TESTS

describe('Router (hash mode, default)', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('defaults to hash mode', () => {
    const router = createRouter();
    expect(router.getMode()).toBe('hash');
  });

  it('matches routes by hash path', () => {
    const handler = vi.fn();
    const router = createRouter().route('/about', handler);
    window.location.hash = '#/about';
    router.init();
    expect(handler).toHaveBeenCalledWith({});
  });

  it('navigate() updates hash', () => {
    const router = createRouter();
    router.navigate('/projects');
    expect(window.location.hash).toBe('#/projects');
  });

  it('getPath() returns the path without the hash sign', () => {
    window.location.hash = '#/about';
    const router = createRouter();
    expect(router.getPath()).toBe('/about');
  });
});

describe('Router (history mode)', () => {
  beforeEach(() => {
    // jsdom doesn't implement pushState/replaceState history changes
    // that re-evaluate window.location.pathname. We stub it.
    window.history.pushState({}, '', '/');
    Object.defineProperty(window, 'location', {
      writable: true,
      value: new URL('http://localhost/'),
    });
  });

  it('uses history mode when configured', () => {
    const router = createRouter({ mode: 'history' });
    expect(router.getMode()).toBe('history');
  });

  it('navigate() calls pushState with full URL', () => {
    const router = createRouter({ mode: 'history' });
    const pushSpy = vi.spyOn(window.history, 'pushState');
    router.navigate('/about');
    expect(pushSpy).toHaveBeenCalled();
    expect(pushSpy.mock.calls[0][2]).toBe('/about');
  });

  it('navigate() prepends base path', () => {
    const router = createRouter({ mode: 'history', base: '/app' });
    const pushSpy = vi.spyOn(window.history, 'pushState');
    router.navigate('/about');
    expect(pushSpy.mock.calls[0][2]).toBe('/app/about');
  });

  it('getPath() returns pathname in history mode', () => {
    Object.defineProperty(window.location, 'pathname', {
      writable: true,
      value: '/about',
    });
    const router = createRouter({ mode: 'history' });
    expect(router.getPath()).toBe('/about');
  });

  it('getPath() strips the base path', () => {
    Object.defineProperty(window.location, 'pathname', {
      writable: true,
      value: '/app/projects',
    });
    const router = createRouter({ mode: 'history', base: '/app' });
    expect(router.getPath()).toBe('/projects');
  });

  it('replace() updates history without triggering handler', () => {
    const handler = vi.fn();
    const router = createRouter({ mode: 'history' }).route('/', handler);
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    router.replace('/redirected');
    expect(replaceSpy).toHaveBeenCalled();
    // handler should not fire from replace() alone
    expect(handler).not.toHaveBeenCalled();
  });

  it('init() is idempotent', () => {
    const router = createRouter({ mode: 'history' });
    router.init();
    router.init();
    // No assertion needed; just shouldn't throw or double-bind.
  });
});

describe('make404Html', () => {
  it('returns valid HTML with a redirect script', () => {
    const html = make404Html();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('l.replace');
  });

  it('uses custom scriptPath when provided', () => {
    const html = make404Html({ scriptPath: '/app/' });
    expect(html).toContain("'/app/'");
  });

  it('escapes single quotes in scriptPath', () => {
    const html = make404Html({ scriptPath: "/it'path/" });
    expect(html).not.toContain("/it'path/");
  });
});

// RENDER TO STRING TESTS

describe('renderToString', () => {
  it('returns empty string for null and undefined', () => {
    expect(renderToString(null)).toBe('');
    expect(renderToString(undefined)).toBe('');
  });

  it('returns empty string for false and true', () => {
    expect(renderToString(false)).toBe('');
    expect(renderToString(true)).toBe('');
  });

  it('escapes HTML in text', () => {
    expect(renderToString('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('escapes & in text', () => {
    expect(renderToString('AT&T')).toBe('AT&amp;T');
  });

  it('renders numbers as text', () => {
    expect(renderToString(42)).toBe('42');
  });

  it('renders a simple element', () => {
    const html = renderToString(div('hello'));
    expect(html).toBe('<div>hello</div>');
  });

  it('renders nested elements', () => {
    const html = renderToString(div([h1('title'), p('body')]));
    expect(html).toBe('<div><h1>title</h1><p>body</p></div>');
  });

  it('renders arrays of elements as siblings', () => {
    const html = renderToString([div('a'), div('b')]);
    expect(html).toBe('<div>a</div><div>b</div>');
  });

  it('renders className and id', () => {
    const html = renderToString(div('x', { ...cls('foo bar'), ...id('myid') }));
    expect(html).toContain('class="foo bar"');
    expect(html).toContain('id="myid"');
  });

  it('renders style object as kebab-case CSS', () => {
    const html = renderToString(div('', css({ color: 'red', fontSize: 14, backgroundColor: '#000' })));
    expect(html).toContain('style="color: red; font-size: 14px; background-color: #000"');
  });

  it('renders data- and aria- attributes', () => {
    const html = renderToString(div('', { 'data-user-id': '123', 'aria-label': 'thing' }));
    expect(html).toContain('data-user-id="123"');
    expect(html).toContain('aria-label="thing"');
  });

  it('renders boolean attributes when true', () => {
    const html = renderToString(input({ ...disabled(), ...required() }));
    expect(html).toContain('disabled');
    expect(html).toContain('required');
  });

  it('omits boolean attributes when false', () => {
    const html = renderToString(input({ disabled: false }));
    expect(html).not.toContain('disabled');
  });

  it('renders void elements without closing tag', () => {
    const html = renderToString([img('a.png'), br(), input()]);
    expect(html).toBe('<img src="a.png"><br><input>');
  });

  it('skips event handlers (no listeners in static HTML)', () => {
    const handler = () => {};
    const html = renderToString(button('click me', on('click', handler)));
    expect(html).toBe('<button>click me</button>');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('on:');
  });

  it('renders empty element with no children', () => {
    expect(renderToString(div())).toBe('<div></div>');
  });

  it('renders deeply nested trees', () => {
    const tree = div([
      div([div([div('deep')])]),
    ]);
    expect(renderToString(tree)).toBe('<div><div><div><div>deep</div></div></div></div>');
  });

  it('escapes attribute values', () => {
    const html = renderToString(div('', { title: 'has "quotes" & <stuff>' }));
    expect(html).toContain('title="has &quot;quotes&quot; &amp; &lt;stuff&gt;"');
  });

  it('matches createDOM output for simple cases (round-trip semantics)', () => {
    const tree = div([h1('Title'), p('Paragraph with <em>emphasis</em>')], cls('container'));
    const html = renderToString(tree);
    // Should produce well-formed HTML that matches what createDOM would output.
    const dom = createDOM(tree);
    expect(dom.outerHTML.toLowerCase()).toBe(html.toLowerCase());
  });
});


// COMPONENT

describe('Component', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="c"></div>'; });

  it('mounts into a container and renders the initial state', () => {
    const c = new Component({ state: { x: 1 }, render: (s: any) => div(`x=${s.x}`) });
    const el = c.mount(document.getElementById('c')!);
    expect(el.innerHTML).toBe('<div>x=1</div>');
  });

  it('setState re-renders the container', () => {
    const c = new Component({ state: { x: 1 }, render: (s: any) => div(`x=${s.x}`) });
    c.mount(document.getElementById('c')!);
    c.setState({ x: 2 });
    expect(document.getElementById('c')!.innerHTML).toBe('<div>x=2</div>');
  });

  it('calls onMount after the first mount', () => {
    const onMount = vi.fn();
    new Component({ state: {}, render: () => div('x'), onMount }).mount(document.getElementById('c')!);
    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it('getState returns a copy, not the internal state', () => {
    const c = new Component({ state: { x: 1 }, render: (s: any) => div(String(s.x)) });
    const a = c.getState();
    a.x = 999;
    expect(c.getState().x).toBe(1);
  });
});

// LAYOUT HELPERS

describe('Layout Helpers', () => {
  it('row creates a flex row with gap', () => {
    const node = createDOM(row([div('a'), div('b')], 12));
    expect((node as HTMLElement).style.display).toBe('flex');
    expect((node as HTMLElement).style.gap).toBe('12px');
  });

  it('column creates a flex column with gap', () => {
    const node = createDOM(column([div('a')], 8));
    expect((node as HTMLElement).style.flexDirection).toBe('column');
    expect((node as HTMLElement).style.gap).toBe('8px');
  });

  it('center wraps content with max-width and centering', () => {
    const node = createDOM(center([div('x')], 800));
    expect((node as HTMLElement).style.maxWidth).toBe('800px');
    expect((node as HTMLElement).style.margin).toBe('0px auto');
  });

  it('grid creates a CSS grid with the given column count', () => {
    const node = createDOM(grid([div('a'), div('b'), div('c')], 4, 20));
    expect((node as HTMLElement).style.display).toBe('grid');
    expect((node as HTMLElement).style.gridTemplateColumns).toBe('repeat(4, 1fr)');
    expect((node as HTMLElement).style.gap).toBe('20px');
  });

  it('flex accepts direction and align options', () => {
    const node = createDOM(flex([div('a')], 'column', 4, 'center'));
    expect((node as HTMLElement).style.flexDirection).toBe('column');
    expect((node as HTMLElement).style.gap).toBe('4px');
    expect((node as HTMLElement).style.alignItems).toBe('center');
  });

  it('full wraps content in a 100% width/height box', () => {
    const node = createDOM(full(div('x')));
    expect((node as HTMLElement).style.width).toBe('100%');
    expect((node as HTMLElement).style.height).toBe('100%');
  });
});

// PATTERNS

describe('Patterns', () => {
  it('card renders title, body, and optional actions', () => {
    const node = createDOM(card('Title', 'body text', [{ label: 'OK', onClick: () => {} }]));
    const html = (node as HTMLElement).outerHTML;
    expect(html).toContain('Title');
    expect(html).toContain('body text');
    expect(html).toContain('OK');
    expect(html).toContain('card-actions');
  });

  it('card without actions omits the actions container', () => {
    const node = createDOM(card('Title', 'body'));
    const html = (node as HTMLElement).outerHTML;
    expect(html).not.toContain('card-actions');
  });

  it('modal renders title and content with overlay', () => {
    const node = createDOM(modal('Hello', [p('world')]));
    expect(node.classList.contains('modal-overlay')).toBe(true);
    expect((node as HTMLElement).outerHTML).toContain('Hello');
    expect((node as HTMLElement).outerHTML).toContain('world');
  });

  it('modal with onClose calls it when the overlay is clicked', () => {
    const onClose = vi.fn();
    const node = createDOM(modal('X', [], onClose)) as HTMLElement;
    document.body.appendChild(node);
    node.dispatchEvent(new Event('click', { bubbles: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    document.body.removeChild(node);
  });

  it('navbar renders brand and nav links', () => {
    const node = createDOM(navbar('Brand', [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }]));
    expect((node as HTMLElement).outerHTML).toContain('Brand');
    expect((node as HTMLElement).outerHTML).toContain('Home');
    expect((node as HTMLElement).outerHTML).toContain('/about');
  });

  it('alert picks a color per type', () => {
    const success = createDOM(alert('Saved', 'success')) as HTMLElement;
    expect(success.style.backgroundColor).toBe('rgb(212, 237, 218)');
    const error = createDOM(alert('Boom', 'error')) as HTMLElement;
    expect(error.style.backgroundColor).toBe('rgb(248, 215, 218)');
  });

  it('spinner injects the nx-spin keyframe and renders the element', () => {
    document.head.innerHTML = '';
    const node = createDOM(spinner(32)) as HTMLElement;
    expect(node.classList.contains('nx-spinner')).toBe(true);
    expect(node.style.width).toBe('32px');
    expect(node.style.height).toBe('32px');
    const injected = document.head.querySelector('style[data-nx-spinner]');
    expect(injected).toBeTruthy();
    expect(injected!.textContent).toContain('@keyframes nx-spin');
  });

  it('spinner only injects the keyframe once across multiple calls', () => {
    // The first test already triggered an injection; verify subsequent
    // calls do not add more <style> tags to <head>.
    const before = document.head.querySelectorAll('style[data-nx-spinner]').length;
    spinner(24);
    spinner(24);
    spinner(24);
    const after = document.head.querySelectorAll('style[data-nx-spinner]').length;
    expect(after).toBe(before);
  });
});

// LAZY CONTAINER

describe('createLazyContainer', () => {
  let container: HTMLElement;
  beforeEach(() => {
    document.body.innerHTML = '<div id="lazy"></div>';
    container = document.getElementById('lazy')!;
  });

  it('renders placeholders for setChildren', () => {
    const lc = createLazyContainer(container);
    lc.setChildren([h('p', {}, 'a'), h('p', {}, 'b'), h('p', {}, 'c')]);
    expect(container.children.length).toBe(3);
    expect(container.querySelectorAll('[data-index]').length).toBe(3);
  });

  it('renderAll mounts every child immediately', () => {
    const lc = createLazyContainer(container);
    lc.setChildren([h('p', {}, 'a'), h('p', {}, 'b')]);
    lc.renderAll();
    expect(container.querySelectorAll('p').length).toBe(2);
    expect(container.querySelectorAll('[data-index]').length).toBe(0);
  });

  it('destroy disconnects the observer', () => {
    const lc = createLazyContainer(container);
    const disconnect = vi.spyOn(IntersectionObserver.prototype, 'disconnect');
    lc.destroy();
    expect(disconnect).toHaveBeenCalled();
  });
});

// DELEGATE EDGE CASES

describe('delegate (edge cases)', () => {
  it('handles clicks on deeply nested children that match the selector', () => {
    document.body.innerHTML = '<div id="root"><div data-x="outer"><div data-x="inner"><span>click me</span></div></div></div>';
    const root = document.getElementById('root')!;
    const handler = vi.fn();
    delegate(root, 'click', '[data-x]', (_, target) => handler((target as HTMLElement).dataset.x));
    root.querySelector('span')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(handler).toHaveBeenCalledWith('inner');
  });

  it('does not fire if the closest match is outside the root', () => {
    document.body.innerHTML = '<div id="root"></div><button data-x>outside</button>';
    const root = document.getElementById('root')!;
    const handler = vi.fn();
    delegate(root, 'click', '[data-x]', () => handler());
    document.querySelector('[data-x]')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('fires for events on document (no need for root.contains check)', () => {
    document.body.innerHTML = '<button data-x>global</button>';
    const handler = vi.fn();
    const off = delegate(document, 'click', '[data-x]', () => handler());
    document.querySelector('[data-x]')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
    off();
  });
});

// HTTP ERROR TYPE

describe('HttpError', () => {
  it('is a class with status and data', () => {
    const err = new HttpError('not found', 404, { error: 'no' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.name).toBe('HttpError');
    expect(err.status).toBe(404);
    expect(err.data).toEqual({ error: 'no' });
    expect(err.message).toBe('not found');
  });
});

// ALIASES AND STYLE EDGE CASES

describe('mainEl and string styles', () => {
  it('mainEl is an alias for main()', () => {
    const a = createDOM(main([p('x')])) as HTMLElement;
    const b = createDOM(mainEl([p('x')])) as HTMLElement;
    expect(a.outerHTML).toBe(b.outerHTML);
    expect(b.tagName).toBe('MAIN');
  });

  it('createDOM applies string styles via setAttribute', () => {
    const node = createDOM(div('x', { style: 'color: red; padding: 10px' }));
    expect((node as HTMLElement).getAttribute('style')).toBe('color: red; padding: 10px');
  });

  it('createDOM applies object styles directly (no automatic px conversion)', () => {
    // Unlike renderToString, the live createDOM does not convert numbers to
    // px — that's the renderer's job. Pass a string for px-aware styles.
    const node = createDOM(div('x', { style: { color: 'red' } }));
    expect((node as HTMLElement).style.color).toBe('red');
  });
});

// MOUNT

describe('mount', () => {
  beforeEach(() => { document.body.innerHTML = '<div id="m"></div>'; });

  it('renders a tree into a container and returns the node', () => {
    const container = document.getElementById('m')!;
    const node = mount(div('hello', cls('greet')), container);
    expect(container.innerHTML).toBe('<div class="greet">hello</div>');
    expect((node as HTMLElement).tagName).toBe('DIV');
  });

  it('replaces existing content in the container', () => {
    const container = document.getElementById('m')!;
    container.innerHTML = '<p>old</p>';
    mount(div('new'), container);
    expect(container.innerHTML).toBe('<div>new</div>');
  });

  it('returns an empty DocumentFragment for an empty array', () => {
    const container = document.getElementById('m')!;
    const node = mount([], container);
    expect(node).toBeInstanceOf(DocumentFragment);
    expect(container.innerHTML).toBe('');
  });

  it('mount can be used as a store.subscribe callback', () => {
    const store = createStore({ msg: 'one' });
    const container = document.getElementById('m')!;
    store.subscribe(() => mount(div(store.getState().msg), container));
    // first render happens because we subscribed AFTER the current state
    // — to trigger an update, call setState
    expect(container.innerHTML).toBe('');  // nothing yet
    store.setState({ msg: 'two' });
    expect(container.innerHTML).toBe('<div>two</div>');
    store.setState({ msg: 'three' });
    expect(container.innerHTML).toBe('<div>three</div>');
  });
});
