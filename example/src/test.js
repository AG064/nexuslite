// Minimal test to check if framework works
import { div, h1, p, createDOM } from '../../framework/src/nexuslite';
function test() {
    const element = div([
        h1('Hello NexusLite'),
        p('This is a test'),
    ]);
    console.log('Element:', element);
    const node = createDOM(element);
    console.log('Node:', node);
    const app = document.getElementById('app');
    if (app)
        app.appendChild(node);
}
test();
