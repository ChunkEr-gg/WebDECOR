import {CommandHistory, parseCommand, terminalFiles, terminalThemes, type TerminalFile, type TerminalTheme} from './hackerlair-commands';

export function initializeTerminal() {
  const root = document.documentElement;
  const form = document.querySelector<HTMLFormElement>('[data-terminal-prompt]');
  const input = form?.querySelector<HTMLInputElement>('input');
  const output = document.querySelector<HTMLElement>('#ht-command-output');
  const main = document.querySelector<HTMLElement>('#ht-document');
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-terminal-file]'));
  if (!form || !input || !output || !main || links.length !== 6 || form.dataset.terminalReady) return;
  const panels = terminalFiles.map(id => document.getElementById(id));
  if (panels.some(panel => !panel)) return;
  form.dataset.terminalReady = 'true';
  const dialog = document.querySelector<HTMLDialogElement>('.ht-help');
  const history = new CommandHistory();
  let returnFocus: HTMLElement | null = null;
  let current: TerminalFile = 'readme';
  const respond = (message: string) => { output.textContent = message; };
  const focusPrompt = () => input.focus();
  const showHelp = () => {
    if (!dialog || dialog.open) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : input;
    dialog.showModal();
  };
  const setTheme = (theme: TerminalTheme) => {
    root.dataset.terminalTheme = theme;
    document.querySelectorAll('[data-palette-name]').forEach(label => { label.textContent = theme; });
    try { localStorage.setItem('webdecor:terminal-theme', theme); } catch { /* Storage is optional. */ }
    window.dispatchEvent(new CustomEvent('webdecor:terminaltheme', {detail: {theme}}));
  };
  const open = (file: TerminalFile, updateHistory = true, focus = false) => {
    current = file;
    panels.forEach(panel => { panel!.hidden = panel!.id !== file; });
    links.forEach(link => {
      const selected = link.dataset.terminalFile === file;
      link.classList.toggle('is-selected', selected);
      if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      link.setAttribute('aria-controls', file === link.dataset.terminalFile ? file : link.dataset.terminalFile!);
    });
    const link = links.find(item => item.dataset.terminalFile === file)!;
    const filename = link.querySelectorAll('span')[1]?.textContent || file;
    const type = link.querySelector('small')?.textContent;
    const names = document.querySelectorAll('[data-document-name]');
    names.forEach(name => { name.textContent = filename; });
    const typeLabel = document.querySelector('[data-document-type]');
    if (typeLabel) typeLabel.textContent = type === 'dir' ? 'directory' : type === 'cfg' ? 'configuration' : 'markdown';
    const status = document.querySelector('[data-document-status]');
    if (status) status.textContent = `${filename} · read mode`;
    const art = document.querySelector<HTMLImageElement>('[data-terminal-art]');
    if (art && link.dataset.artSrc) {
      art.src = link.dataset.artSrc;
      art.alt = link.dataset.artAlt || `${(link.dataset.artCaption || 'Photograph').split(' / ')[0]} rendered as terminal characters`;
    }
    const caption = document.querySelector('figcaption[data-art-caption]');
    if (caption) caption.textContent = link.dataset.artCaption || '';
    if (updateHistory && location.hash !== `#${file}`) window.history.pushState(null, '', `#${file}`);
    respond(`Opened ${filename}.`);
    const scroll = main.querySelector('.ht-document-scroll');
    if (scroll) scroll.scrollTop = 0;
    window.dispatchEvent(new CustomEvent('webdecor:worldchange'));
    if (focus) main.focus({preventScroll: true});
  };
  const readHash = () => {
    const id = location.hash.slice(1);
    if (terminalFiles.includes(id as TerminalFile)) open(id as TerminalFile, false);
    else if (!id) open('readme', false);
  };
  const run = (raw: string) => {
    const command = parseCommand(raw);
    switch (command.kind) {
      case 'open': open(command.file); break;
      case 'help': showHelp(); respond('Command reference opened. Escape returns to the workspace.'); break;
      case 'ls': respond('README.md · services.md · studies/ · pricing.cfg · studio.md · new-project.md'); break;
      case 'theme': setTheme(command.theme); respond(`Palette set to ${command.theme}.`); break;
      case 'clear': respond(''); break;
      case 'exit': location.assign('/'); break;
      case 'error': respond(command.message); break;
    }
  };
  form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button').forEach(control => { control.disabled = false; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.slice(0, 180);
    history.add(raw); input.value = ''; run(raw);
  });
  input.addEventListener('keydown', event => {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); input.value = history.move(event.key === 'ArrowUp' ? -1 : 1, input.value);
      input.setSelectionRange(input.value.length, input.value.length);
    }
  });
  links.forEach((link, index) => link.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    let next: number;
    if (event.key === 'ArrowDown') next = (index + 1) % links.length;
    else if (event.key === 'ArrowUp') next = (index + links.length - 1) % links.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = links.length - 1;
    else return;
    event.preventDefault(); links[next].focus(); open(links[next].dataset.terminalFile as TerminalFile);
  }));
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-terminal-file], [data-terminal-open], [data-terminal-command], [data-terminal-plan], [data-terminal-help], [data-terminal-close-help], [data-terminal-focus], [data-terminal-palette]') : null;
    if (!target) return;
    if (target instanceof HTMLAnchorElement && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)) return;
    const file = target.dataset.terminalFile || target.dataset.terminalOpen;
    if (file && terminalFiles.includes(file as TerminalFile)) { event.preventDefault(); open(file as TerminalFile, true, !target.dataset.terminalFile); }
    else if (target.dataset.terminalPlan) {
      const select = document.querySelector<HTMLSelectElement>('.ag-inquiry-form select[name="plan"]');
      if (select && Array.from(select.options).some(option => option.value === target.dataset.terminalPlan)) {
        select.value = target.dataset.terminalPlan; select.dispatchEvent(new Event('change', {bubbles: true}));
        open('project', true, true); respond(`Selected ${select.value}. Complete your project brief.`);
      }
    } else if (target.hasAttribute('data-terminal-help')) showHelp();
    else if (target.hasAttribute('data-terminal-close-help')) dialog?.close();
    else if (target.hasAttribute('data-terminal-focus')) focusPrompt();
    else if (target.hasAttribute('data-terminal-command')) { run(target.dataset.terminalCommand || ''); }
    else if (target.hasAttribute('data-terminal-palette')) {
      const theme = root.dataset.terminalTheme as TerminalTheme;
      setTheme(terminalThemes[(terminalThemes.indexOf(theme) + 1) % terminalThemes.length]);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || dialog?.open) return;
    const target = event.target;
    if (target instanceof Element && target.closest('input, textarea, select, [contenteditable], form')) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault(); focusPrompt();
    } else if (event.altKey && !event.ctrlKey && !event.metaKey && /^[1-6]$/.test(event.key)) {
      event.preventDefault(); open(terminalFiles[Number(event.key) - 1], true, true);
    } else if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); showHelp();
    }
  });
  dialog?.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus(); returnFocus = null; });
  window.addEventListener('hashchange', readHash);
  window.addEventListener('popstate', readHash);
  window.addEventListener('pageshow', () => { readHash(); window.dispatchEvent(new CustomEvent('webdecor:terminaltheme', {detail: {theme: root.dataset.terminalTheme}})); });
  let initialTheme: TerminalTheme = 'phosphor';
  try { const stored = localStorage.getItem('webdecor:terminal-theme'); if (terminalThemes.includes(stored as TerminalTheme)) initialTheme = stored as TerminalTheme; } catch { /* Use the default without storage. */ }
  setTheme(initialTheme);
  open(terminalFiles.includes(location.hash.slice(1) as TerminalFile) ? location.hash.slice(1) as TerminalFile : current, false);
}

initializeTerminal();
document.addEventListener('astro:page-load', initializeTerminal);
