import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  h, div, span, p, h1, h2, button, input, br, createDOM, renderToString,
  ul, ol, li, img, form, label, select, option,
  cls, css, id, data, on, onMulti, href, ph, type, inputType, name, val,
  disabled, required, autofocus, readonly, checked, bindTo,
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
