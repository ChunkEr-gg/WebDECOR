import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';

// A small DOM adapter exercises the actual bundled module without a server or browser.
class Target {
  listeners = new Map();
  addEventListener(type, fn) { const items = this.listeners.get(type) || []; items.push(fn); this.listeners.set(type, items); }
  dispatchEvent(event) { event.target ||= this; for (const fn of this.listeners.get(event.type) || []) fn(event); return !event.defaultPrevented; }
}
class FakeEvent {
  constructor(type, options = {}) { Object.assign(this, {type, defaultPrevented: false, button: 0}, options); }
  preventDefault() { this.defaultPrevented = true; }
}
class Element extends Target {
  constructor(id = '', attrs = {}) {
    super(); this.id = id; this.attrs = {...attrs}; this.dataset = {}; this.map = new Map();
    this.textContent = ''; this.hidden = false; this.isConnected = true;
    this.classList = {toggle: (name, value) => { this.attrs[name] = value; }};
    for (const [key, value] of Object.entries(attrs)) if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) { return this.map.get(selector) || []; }
  setAttribute(key, value) { this.attrs[key] = value; }
  removeAttribute(key) { delete this.attrs[key]; }
  hasAttribute(key) { return key in this.attrs; }
  closest(selector) {
    if (selector.includes('input, textarea')) return this.editable ? this : null;
    return Object.keys(this.attrs).some(key => selector.includes(`[${key}]`)) ? this : null;
  }
  focus() { document.activeElement = this; }
}
class Anchor extends Element {}
class Input extends Element { value = ''; disabled = true; editable = true; setSelectionRange() {} }
class Dialog extends Element {
  open = false;
  showModal() { this.open = true; this.focus(); }
  close() { this.open = false; this.dispatchEvent(new FakeEvent('close')); }
}
const ids = ['readme', 'services', 'studies', 'pricing', 'studio', 'project'];
const filenames = ['README.md', 'services.md', 'studies/', 'pricing.cfg', 'studio.md', 'new-project.md'];
const root = new Element();
const form = new Element(); const input = new Input(); const submit = new Input(); const output = new Element();
const main = new Element(); const scroll = new Element(); main.map.set('.ht-document-scroll', [scroll]);
const dialog = new Dialog(); const select = new Input(); select.options = ['explore', 'essential', 'expanded', 'custom'].map(value => ({value}));
const art = new Element(); const caption = new Element(); const name = new Element(); const type = new Element(); const status = new Element(); const palette = new Element();
const panels = ids.map(id => new Element(id));
const links = ids.map((id, index) => {
  const link = new Anchor('', {'data-terminal-file': id, 'data-art-src': `/images/${id}.webp`, 'data-art-caption': `${id} / character field`, 'data-art-alt': `${id} artwork`});
  const label = new Element(); label.textContent = filenames[index]; const type = new Element(); type.textContent = 'md';
  link.map.set('span', [new Element(), label]); link.map.set('small', [type]); return link;
});
form.map.set('input', [input]); form.map.set('input, button', [input, submit]);
const document = new Target(); document.documentElement = root; document.activeElement = new Element();
const mapping = new Map([
  ['[data-terminal-prompt]', [form]], ['#ht-command-output', [output]], ['#ht-document', [main]],
  ['[data-terminal-file]', links], ['.ht-help', [dialog]], ['[data-palette-name]', [palette]],
  ['[data-document-name]', [name]], ['[data-document-type]', [type]], ['[data-document-status]', [status]],
  ['[data-terminal-art]', [art]], ['figcaption[data-art-caption]', [caption]], ['.ag-inquiry-form select[name="plan"]', [select]],
]);
document.querySelectorAll = selector => mapping.get(selector) || [];
document.querySelector = selector => document.querySelectorAll(selector)[0] || null;
document.getElementById = id => panels.find(panel => panel.id === id);
const window = new Target();
const location = {hash: '#studio', assign: path => { location.assigned = path; }};
const entries = [];
window.history = {pushState: (_state, _title, hash) => { entries.push(hash); location.hash = hash; }};
let storageFails = true; const values = new Map();
const localStorage = {getItem(key) { if (storageFails) throw Error('denied'); return values.get(key); }, setItem(key, value) { if (storageFails) throw Error('denied'); values.set(key, value); }};
Object.assign(globalThis, {document, window, location, localStorage, Element, HTMLElement: Element, HTMLAnchorElement: Anchor, Event: FakeEvent, CustomEvent: FakeEvent});
const bundle = await build({entryPoints: ['src/scripts/hackerlair-tui.ts'], bundle: true, format: 'esm', write: false, platform: 'node'});
const initialFocus = document.activeElement;
await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const visible = () => panels.filter(panel => !panel.hidden).map(panel => panel.id);
const command = value => { input.value = value; form.dispatchEvent(new FakeEvent('submit')); };
const click = target => document.dispatchEvent(new FakeEvent('click', {target}));
const key = (target, value, modifiers = {}) => target.dispatchEvent(new FakeEvent('keydown', {key: value, ...modifiers}));
assert.deepEqual(visible(), ['studio']); assert.equal(document.activeElement, initialFocus); assert.equal(input.disabled, false);
assert.equal(art.alt, 'studio artwork'); assert.equal(root.dataset.terminalTheme, 'phosphor');
command('cat ./services.md'); assert.deepEqual(visible(), ['services']); assert.equal(location.hash, '#services');
command('ls'); assert.match(output.textContent, /README.md.*new-project.md/);
command('open does-not-exist'); assert.match(output.textContent, /No file/); assert.deepEqual(visible(), ['services']);
command('open pricing; alert(1)'); assert.match(output.textContent, /Usage/); assert.deepEqual(visible(), ['services']);
command('<img src=x onerror=alert(1)>'); assert.match(output.textContent, /Unknown command/); assert.equal(output.querySelectorAll('img').length, 0);
command('theme amber'); assert.equal(root.dataset.terminalTheme, 'amber');
storageFails = false; click(new Element('', {'data-terminal-palette': ''})); assert.equal(root.dataset.terminalTheme, 'mono'); assert.equal(values.get('webdecor:terminal-theme'), 'mono');
for (const plan of ['essential', 'expanded', 'custom']) {
  click(new Element('', {'data-terminal-plan': plan})); assert.equal(select.value, plan); assert.deepEqual(visible(), ['project']);
}
key(links[0], 'End'); assert.deepEqual(visible(), ['project']); assert.equal(document.activeElement, links[5]);
key(links[5], 'ArrowDown'); assert.deepEqual(visible(), ['readme']);
key(links[0], 'ArrowUp'); assert.deepEqual(visible(), ['project']);
key(links[5], 'Home'); assert.deepEqual(visible(), ['readme']);
key(document, '2', {altKey: true}); assert.deepEqual(visible(), ['services']);
const editable = new Input(); document.dispatchEvent(new FakeEvent('keydown', {target: editable, key: '4', altKey: true})); assert.deepEqual(visible(), ['services']);
key(document, 'k', {ctrlKey: true}); assert.equal(document.activeElement, input);
input.value = 'draft'; key(input, 'ArrowUp'); assert.equal(input.value, 'theme amber'); key(input, 'ArrowDown'); assert.equal(input.value, 'draft');
input.focus(); command('help'); assert.equal(dialog.open, true); dialog.close(); assert.equal(document.activeElement, input);
command('clear'); assert.equal(output.textContent, '');
location.hash = '#pricing'; window.dispatchEvent(new FakeEvent('popstate')); assert.deepEqual(visible(), ['pricing']);
location.hash = '#studies'; window.dispatchEvent(new FakeEvent('hashchange')); assert.deepEqual(visible(), ['studies']);
location.hash = ''; window.dispatchEvent(new FakeEvent('popstate')); assert.deepEqual(visible(), ['readme']);
const listenerCount = document.listeners.get('click').length; document.dispatchEvent(new FakeEvent('astro:page-load')); assert.equal(document.listeners.get('click').length, listenerCount);
location.hash = '#project'; window.dispatchEvent(new FakeEvent('pageshow')); assert.deepEqual(visible(), ['project']);
command('exit'); assert.equal(location.assigned, '/');
const parserBundle = await build({entryPoints: ['src/scripts/hackerlair-commands.ts'], bundle: true, format: 'esm', write: false, platform: 'node'});
const parser = await import(`data:text/javascript;base64,${Buffer.from(parserBundle.outputFiles[0].text).toString('base64')}`);
const history = new parser.CommandHistory(); for (let i = 0; i < 100; i++) history.add(`command ${i}`);
let recalled; for (let i = 0; i < 100; i++) recalled = history.move(-1, ''); assert.equal(recalled, 'command 50');
for (const alias of ['open README.md', 'cd ~', 'cat ./readme.md']) assert.deepEqual(parser.parseCommand(alias), {kind: 'open', file: 'readme'});
assert.deepEqual(parser.parseCommand('pricing'), {kind: 'open', file: 'pricing'});
assert.equal(parser.parseCommand('theme violet').kind, 'error');
for (const name of ['__proto__', 'constructor', 'toString']) assert.equal(parser.parseCommand(`open ${name}`).kind, 'error');
const markup = await readFile('src/components/HackerlairExperience.astro', 'utf8');
assert.doesNotMatch(markup, /<section[^>]+hidden/); assert.match(markup, /data-terminal-prompt/);
assert.match(markup, /<input[^>]+disabled/); assert.match(markup, /data-terminal-plan/);
console.log('Hackerlair checks passed: safe commands, bounded history, six-file navigation, hash/back-forward, editable keyboard protection, plans, palette/storage fallback, help focus, enhancement and lifecycle.');
