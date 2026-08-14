import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  h, div, span, p, h1, h2, button, input, createDOM,
  ul, ol, li, img, form, label, select, option,
  cls, css, id, data, on, onMulti, href, ph, type, name, val,
  disabled, required, autofocus, readonly, checked,
  row, column, center, grid, flex, full,
  createStore, createApp,
  createRouter, Router, make404Html,
  createDragDropContainer, draggable, dropZone,
} from './nexuslite';

// SETUP

beforeEach(() => {
  document.body.innerHTML = '';
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
});

// ATTRIBUTE HELPER TESTS

describe('Attribute Helpers', () => {
  it('cls joins class names', () => {
    const result = cls('btn', 'btn-primary');
    expect(result.className).toBe('btn btn-primary');
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
