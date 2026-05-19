import {
  // Elements
  div, h1, h2, p, span, button, input, textarea, select, option,
  ul, li, img, br, hr,
  nav, header, footer, main, section, article, aside,
  form, label, fieldset, legend,
  // Attributes
  cls, css, id, data, on, onMulti, href, ph, type, name, val,
  disabled, required, autofocus, readonly, checked,
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
  // Drag and Drop
  createDragDropContainer, draggable, dropZone,
  // Patterns
  card, modal, navbar, alert, spinner,
} from '../../framework/src/nexuslite';

// KANBAN BOARD - Uses ALL NexusLite features

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  column: string;
}

interface AppState {
  tasks: Task[];
  columns: { id: string; title: string }[];
  showModal: boolean;
  modalColumn: string;
  view: 'board' | 'stats' | 'lazy';
  selectedTask: Task | null;
}

// Initial state with some demo tasks
const initialState: AppState = {
  tasks: [
    { id: '1', title: 'Design login page', description: 'Create wireframes for auth flow', priority: 'high', column: 'todo' },
    { id: '2', title: 'Set up CI/CD', description: 'Configure GitHub Actions', priority: 'medium', column: 'todo' },
    { id: '3', title: 'Write API docs', description: 'Document REST endpoints', priority: 'low', column: 'inprogress' },
    { id: '4', title: 'Fix navigation bug', description: 'Menu not closing on mobile', priority: 'high', column: 'inprogress' },
    { id: '5', title: 'Code review', description: 'Review PR #47', priority: 'medium', column: 'review' },
    { id: '6', title: 'Update deps', description: 'Audit npm packages', priority: 'low', column: 'done' },
  ],
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'review', title: 'In Review' },
    { id: 'done', title: 'Done' },
  ],
  showModal: false,
  modalColumn: '',
  view: 'board',
  selectedTask: null,
};

// HTTP client for remote data
const api = createHttp('https://jsonplaceholder.typicode.com');

// KANBAN APP

function startKanban() {
  const store = createStore(initialState);

  const router = createRouter();

  // Load from localStorage if available
  const saved = localStorage.getItem('nexuslite-kanban-state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      store.setState(parsed);
    } catch {}
  }

  // Persist to localStorage on changes
  store.subscribe((state: AppState) => {
    localStorage.setItem('nexuslite-kanban-state', JSON.stringify(state));

    // Setup drag and drop for board view
    if (state.view === 'board') {
      setTimeout(() => {
        const boardEl = document.getElementById('kanban-app');
        if (boardEl && !boardEl.hasAttribute('data-dnd-init')) {
          boardEl.setAttribute('data-dnd-init', 'true');
          createDragDropContainer(boardEl, {
            onDrop: (taskId: string, columnId: string) => {
              const currentState = store.getState();
              const task = currentState.tasks.find((t: Task) => t.id === taskId);
              if (task && task.column !== columnId) {
                store.setState({
                  tasks: currentState.tasks.map((t: Task) =>
                    t.id === taskId ? { ...t, column: columnId } : t
                  ),
                });
              }
            },
          });
        }
      }, 0);
    }

    if (state.view === 'lazy') {
      setTimeout(() => {
        const lazyContainerEl = document.getElementById('lazy-container');
        if (lazyContainerEl && !lazyContainerEl.hasAttribute('data-lazy-init')) {
          lazyContainerEl.setAttribute('data-lazy-init', 'true');
          const lazy = createLazyContainer(lazyContainerEl);
          const lazyItems = Array.from({ length: 100 }, (_, i) =>
            div(`Lazy item #${i + 1}`, css({ padding: '16px', background: i % 2 === 0 ? '#fff' : '#f6f8fa', borderRadius: '8px', marginBottom: '8px' }))
          );
          lazy.setChildren(lazyItems);

          const bypassBtn = document.getElementById('bypass-lazy-btn');
          if (bypassBtn) {
            bypassBtn.onclick = () => lazy.renderAll();
          }
        }
      }, 0);
    }
  });

  // Render function
  function renderApp(state: AppState) {
    return div({ id: 'kanban-app' }, [
      // Header
      header([
        h1('NexusLite Kanban Board'),
      ], css({ padding: '20px', background: '#f8f9fa', marginBottom: '20px' })),

      // Navigation tabs
      nav([cls('nav-tabs')], [
        tab('Board', state.view === 'board', () => router.navigate('board')),
        tab('Statistics', state.view === 'stats', () => router.navigate('stats')),
        tab('Lazy Demo', state.view === 'lazy', () => router.navigate('lazy')),
      ]),

      // Main content based on view
      state.view === 'board' ? renderBoard(state) : null,
      state.view === 'stats' ? renderStats(state) : null,
      state.view === 'lazy' ? renderLazyDemo(state) : null,

      // Modal
      state.showModal ? renderAddModal(state) : null,
    ]);
  }

  function tab(label: string, active: boolean, onClick: () => void) {
    return button(label, {
      on: { click: onClick },
      className: active ? 'nav-tab nav-tab-active' : 'nav-tab',
      style: {
        padding: '8px 16px',
        marginRight: '8px',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        cursor: 'pointer',
        background: active ? '#fff' : '#e9ecef',
        color: active ? '#333' : '#666',
        fontWeight: active ? '600' : '400',
      },
    });
  }

  function renderBoard(state: AppState) {
    return div([cls('board')], state.columns.map(col =>
      div([cls('column')], [
        // Column header
        div([cls('column-header')], [
          span(col.title, css({ fontWeight: '600', fontSize: '18px' })),
          span(String(state.tasks.filter(t => t.column === col.id).length), [cls('column-count')]),
        ]),

        // Task list (drop zone)
        div([cls('task-list'), dropZone(col.id)],
          state.tasks.filter(t => t.column === col.id).length === 0
            ? [span('No tasks', css({ color: '#999', fontStyle: 'italic' }))]
            : state.tasks.filter(t => t.column === col.id).map(task => renderTaskCard(task))
        ),

        // Add button
        button('+ Add task', {
          on: { click: () => store.setState({ showModal: true, modalColumn: col.id }) },
          className: 'add-task-btn',
          style: {
            marginTop: '12px',
            padding: '10px',
            width: '100%',
            border: '2px dashed #d0d7de',
            borderRadius: '8px',
            background: 'transparent',
            color: '#57606a',
            cursor: 'pointer',
          },
        }),
      ])
    ));
  }

  function renderTaskCard(task: Task) {
    const priorityColors = { high: '#ff6b6b', medium: '#ffd93d', low: '#6bcb77' };
    const color = priorityColors[task.priority];

    return div({
      className: 'task-card',
      'data-task-id': task.id,
      ...draggable(task.id),
      on: {
        click: () => {
          const state = store.getState();
          store.setState({ selectedTask: task });
        },
      },
      style: {
        background: '#fff',
        padding: '14px',
        borderRadius: '8px',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        cursor: 'grab',
      },
    }, [
      div([task.title], css({ fontWeight: '500', marginBottom: '8px' })),
      row([
        span(task.priority, css({
          padding: '2px 8px',
          borderRadius: '4px',
          background: color,
          color: '#fff',
          fontSize: '12px',
          fontWeight: '500',
        })),
        span('×', {
          on: {
            click: (e: Event) => {
              e.stopPropagation();
              const state = store.getState();
              store.setState({
                tasks: state.tasks.filter((t: Task) => t.id !== task.id),
              });
            },
          },
          style: { color: '#ff6b6b', cursor: 'pointer', marginLeft: 'auto' },
        }),
      ], 8),
    ]);
  }

  function renderStats(state: AppState) {
    const total = state.tasks.length;
    const todo = state.tasks.filter(t => t.column === 'todo').length;
    const inprogress = state.tasks.filter(t => t.column === 'inprogress').length;
    const review = state.tasks.filter(t => t.column === 'review').length;
    const done = state.tasks.filter(t => t.column === 'done').length;

    return div([css({ padding: '20px' })], [
      h2('Task Statistics'),
      grid([
        statCard('Total', total),
        statCard('To Do', todo),
        statCard('In Progress', inprogress),
        statCard('In Review', review),
        statCard('Done', done),
      ], 5, 16),

      h2('Remote Data Demo', css({ marginTop: '40px' })),
      button('Fetch users from API', {
        on: { click: () => fetchRemoteData() },
        className: 'btn-primary',
      }),
      div([id('api-results')], css({ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '12px' })),
    ]);
  }

  async function fetchRemoteData() {
    const resultsEl = document.getElementById('api-results');
    if (!resultsEl) return;

    try {
      const res = await api.get('/users?_limit=5');
      const users = res.data as any[];

      resultsEl.innerHTML = '';
      const list = document.createElement('ul');
      list.style.cssText = 'list-style: none; padding: 0;';
      users.forEach((user: any) => {
        const li_ = document.createElement('li');
        li_.style.cssText = 'padding: 8px 0; border-bottom: 1px solid #e8ecf0;';
        li_.textContent = `${user.name} (${user.email})`;
        list.appendChild(li_);
      });
      resultsEl.appendChild(list);
    } catch {
      resultsEl.innerHTML = '<p style="color: #ff6b6b;">Failed to load data</p>';
    }
  }

  function statCard(label: string, value: number) {
    return div([
      span(label, css({ fontSize: '12px', color: '#57606a', textTransform: 'uppercase' })),
      span(String(value), css({ fontSize: '32px', fontWeight: 'bold' })),
    ], css({
      padding: '20px',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }));
  }

  function renderLazyDemo(state: AppState) {
    return div([css({ padding: '20px' })], [
      h2('Lazy Rendering Demo'),
      p('Scroll down. Items render only when entering viewport (IntersectionObserver).', css({ color: '#57606a', marginBottom: '16px' })),
      button('Render All (bypass lazy)', {
        id: 'bypass-lazy-btn',
        className: 'btn-secondary',
        style: { marginBottom: '16px' },
      }),
      div([id('lazy-container'), css({ maxHeight: '400px', overflowY: 'auto', background: '#fff', borderRadius: '12px', padding: '16px' })], []),
    ]);
  }

  function renderAddModal(state: AppState) {
    return div({
      className: 'modal-overlay',
      on: { click: (e: Event) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
          store.setState({ showModal: false });
        }
      }},
      style: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      },
    }, [
      div({
        style: {
          background: '#fff',
          padding: '24px',
          borderRadius: '16px',
          width: '400px',
          maxWidth: '90vw',
        },
      }, [
        h2('Add New Task', css({ marginBottom: '20px' })),
        form([
          div([css({ marginBottom: '16px' })], [
            label('Title', { for: 'task-title' }),
            input({ id: 'task-title', name: 'title', placeholder: 'Task title', required: true, style: { width: '100%', padding: '10px', border: '2px solid #d0d7de', borderRadius: '8px', fontSize: '15px' } }),
          ]),
          div([css({ marginBottom: '16px' })], [
            label('Description', { for: 'task-desc' }),
            textarea('', { id: 'task-desc', name: 'description', placeholder: 'Task description', style: { width: '100%', padding: '10px', border: '2px solid #d0d7de', borderRadius: '8px', fontSize: '15px', resize: 'vertical' } }),
          ]),
          div([css({ marginBottom: '20px' })], [
            label('Priority', { for: 'task-priority' }),
            select([
              option('Low', 'low'),
              option('Medium', 'medium'),
              option('High', 'high'),
            ], { id: 'task-priority', name: 'priority', style: { width: '100%', padding: '10px', border: '2px solid #d0d7de', borderRadius: '8px', fontSize: '15px' } }),
          ]),
          div([cls('modal-actions')], [
            button('Cancel', {
              on: { click: (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                store.setState({ showModal: false });
              }},
              className: 'btn-secondary',
              style: { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginRight: '12px' },
            }),
            button('Add Task', {
              className: 'btn-primary',
              style: { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#0969da', color: '#fff' },
              on: {
                click: (e: Event) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const titleInput = document.getElementById('task-title') as HTMLInputElement;
                  const descInput = document.getElementById('task-desc') as HTMLTextAreaElement;
                  const prioritySelect = document.getElementById('task-priority') as HTMLSelectElement;
                  const title = titleInput?.value?.trim();
                  if (!title) {
                    alert('Please enter a task title');
                    return;
                  }
                  const newTask: Task = {
                    id: String(Date.now()),
                    title,
                    description: descInput?.value?.trim() || '',
                    priority: (prioritySelect?.value as 'high' | 'medium' | 'low') || 'medium',
                    column: state.modalColumn,
                  };
                  const currentState = store.getState();
                  store.setState({
                    tasks: [...currentState.tasks, newTask],
                    showModal: false,
                  });
                },
              },
            }),
          ]),
        ], {
          on: { submit: (e: Event) => e.preventDefault() },
        }),
      ]),
    ]);
  }

  // Start the app
  createApp({
    root: '#app',
    state: store,
    render: renderApp,
  });

  router
    .route('/board', () => store.setState({ view: 'board' }))
    .route('/stats', () => store.setState({ view: 'stats' }))
    .route('/lazy', () => store.setState({ view: 'lazy' }))
    .route('/', () => router.navigate('board'))
    .notFound(() => router.navigate('board'));

  router.init();
}

// Bootstrap

startKanban();
