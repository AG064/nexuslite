/**
  NexusLite — Usage Examples
  See how readable and natural the code looks
 */
// EXAMPLE 1: Simple Landing Page
import { 
// Elements (shortcuts)
div, h1, h2, p, button, span, input, textarea, label, footer, 
// Attributes
cls, css, 
// Layout
row, column, center, grid, 
// Patterns
card, navbar, alert, 
// App
createApp, } from '../../framework/src/nexuslite';
// Landing page example
const landingPage = () => {
    const state = { heroVisible: true };
    return createApp({
        root: '#app',
        state,
        render: (s) => center([
            // Navbar
            navbar('MyBrand', [
                { label: 'Home', href: '#' },
                { label: 'About', href: '#about' },
                { label: 'Contact', href: '#contact' },
            ]),
            // Hero section
            div([
                h1('Build Websites Fast'),
                p('A comfortable framework for modern web development'),
                button('Get Started', { on: { click: () => console.log('clicked!') }, className: 'btn-primary' }),
            ], css({ textAlign: 'center', padding: '80px 0' })),
            // Features grid
            grid([
                card('Fast', 'Build websites quickly with intuitive syntax'),
                card('Easy', 'Code that reads like natural language'),
                card('Flexible', 'Works for any type of website'),
            ], 3, 24),
            // Footer
            footer(p('© 2024 MyBrand. All rights reserved.'), css({ textAlign: 'center', padding: '40px 0', marginTop: '60px' })),
        ]),
    });
};
// EXAMPLE 2: Todo List (Dashboard style)
const todoApp = () => {
    const state = {
        todos: ['Learn TypeScript', 'Build a framework', 'Ship it'],
        inputValue: '',
    };
    return createApp({
        root: '#app',
        state,
        render: (s) => column([
            h1('My Todo List'),
            alert(`You have ${s.todos.length} tasks`, 'info'),
            // Input row
            row([
                input({ placeholder: 'What needs to be done?', value: s.inputValue }),
                button('Add', { on: { click: () => { } } }),
            ], 12),
            // Todo list
            div(s.todos.map((todo, i) => row([
                span(`${i + 1}. ${todo}`),
                button('×', { on: { click: () => { } }, className: 'btn-delete' }),
            ], 12)), css({ marginTop: '24px' })),
        ], 16),
    });
};
// EXAMPLE 3: Form with Validation
const contactForm = () => {
    const state = { name: '', email: '', message: '', submitted: false };
    return createApp({
        root: '#app',
        state,
        render: (s) => center([
            h1('Contact Us'),
            s.submitted
                ? div([
                    alert('Message sent successfully!', 'success'),
                    button('Send Another', { on: { click: () => { } } }),
                ])
                : div([
                    div([
                        label('Name'),
                        input({ name: 'name', value: s.name, placeholder: 'Your name', required: true }),
                    ], cls('form-field')),
                    div([
                        label('Email'),
                        input({ name: 'email', type: 'email', value: s.email, placeholder: 'your@email.com', required: true }),
                    ], cls('form-field')),
                    div([
                        label('Message'),
                        textarea(s.message, { name: 'message', placeholder: 'Your message...', rows: 5, required: true }),
                    ], cls('form-field')),
                    button('Send Message', { type: 'submit', className: 'btn-primary' }),
                ], { on: { submit: (e) => e.preventDefault() } }),
        ], 20),
    });
};
// EXAMPLE 4: Dashboard with Stats
const dashboard = () => {
    const stats = [
        { label: 'Total Users', value: '1,234' },
        { label: 'Revenue', value: '$45,678' },
        { label: 'Active Now', value: '89' },
    ];
    return createApp({
        root: '#app',
        state: { stats },
        render: (s) => column([
            h1('Dashboard'),
            grid(s.stats.map((stat) => div([
                span(stat.label, css({ color: '#666', fontSize: '14px' })),
                span(stat.value, css({ fontSize: '32px', fontWeight: 'bold' })),
            ], css({ padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }))), 3, 20),
        ], 24),
    });
};
// EXAMPLE 5: Modal Example
const modalExample = () => {
    const state = { modalOpen: false };
    return createApp({
        root: '#app',
        state,
        render: (s) => column([
            button('Open Modal', {
                on: { click: () => { } },
                className: 'btn-primary',
            }),
            s.modalOpen ? div([
                div([
                    h2('Modal Title'),
                    p('This is a modal dialog'),
                    row([
                        button('Cancel', { on: { click: () => { } }, className: 'btn-secondary' }),
                        button('Confirm', { on: { click: () => { } }, className: 'btn-primary' }),
                    ], 12),
                ], css({ padding: '24px', background: '#fff', borderRadius: '12px', maxWidth: '400px' })),
            ], {
                className: 'modal-overlay',
                style: {
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                },
                on: { click: (e) => {
                        if (e.target.classList.contains('modal-overlay')) { }
                    } },
            }) : null,
        ], 16),
    });
};
// RUN EXAMPLES
// landingPage();
// todoApp();
// contactForm();
// dashboard();
// modalExample();
console.log('NexusLite examples loaded. Uncomment a function to run it.');
