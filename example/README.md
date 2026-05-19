# Nexus.js Landing Page Example

A modern product landing page demonstrating the Nexus.js framework API.

## Run

```bash
cd example
npm install
npm run dev
```

Open: http://localhost:5173/landing.html

## What's Demonstrated

### Elements
```typescript
div('Hello')           // div with text content
h1('Title')           // heading
h2('Subtitle')        // subheading
p('Paragraph text')   // paragraph
span('Label')         // inline text
button('Click me')    // button
input({ type: 'text' })  // input field
textarea()            // textarea
form([...])           // form container
img('url', { alt: '...' })  // image
ul([...])             // unordered list
li('Item')            // list item
hr()                  // horizontal rule
spacer(24)            // vertical spacing element
nav([...])            // navigation container
header([...])         // page header
footer([...])         // page footer
main([...])           // main content area
section([...])        // section container
```

### Layout Helpers
```typescript
// Horizontal flex row with gap
row([div('A'), div('B')], 16)

// Vertical flex column with gap
column([div('A'), div('B')], 12)

// Centered container with max-width
center([content], 800)

// CSS Grid with columns and gap
grid([card1, card2, card3], 3, 20)

// Flex with direction control
flex([items], 'row', 16, 'stretch')
```

### Attributes
```typescript
// className helper (avoid conflicts with 'class')
cls('btn', 'btn-primary')  // → { className: 'btn btn-primary' }

// Inline styles object
css({ color: 'red', fontSize: '14px', padding: '12px' })

// ID shortcut
id('my-element')  // → { id: 'my-element' }

// Event handlers
on('click', handler)  // → { on: { click: handler } }
onMulti({ click: fn1, submit: fn2 })

// Link href
href('https://example.com', '_blank')
```

### State Management
```typescript
import { createStore } from 'nexus';

const store = createStore({ selectedPlan: 'basic' });

// Get value
store.get('selectedPlan')  // → 'basic'

// Set value (triggers re-render if used in render)
store.set('selectedPlan', 'pro')

// Get entire state
store.getState()

// Subscribe to changes
store.subscribe(state => console.log(state))
```

### Building the DOM
```typescript
import { createDOM } from 'nexus';

const element = div([h1('Hello'), button('Click')]);
const node = createDOM(element);
document.getElementById('app').appendChild(node);
```

## File Structure

```
example/
├── index.html      # Kanban board example (original)
├── landing.html    # Landing page example (new)
├── src/
│   ├── main.ts     # Kanban board code
│   └── landing.ts  # Landing page code
└── package.json
```

## Building for Production

```bash
npm run build
# Output goes to dist/
```

Serve the dist folder with any static file server.