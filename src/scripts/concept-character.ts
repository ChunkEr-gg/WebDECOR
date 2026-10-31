// Concept page: the Cybercore switch, and the template-versus-character demo.
const root = document.documentElement;
const storageKey = 'webdecor-concept-cybercore';

const switchButton = document.querySelector<HTMLButtonElement>('[data-concept-switch]');
const setPower = (on: boolean) => {
  if (on) root.dataset.on = 'true'; else delete root.dataset.on;
  switchButton?.setAttribute('aria-checked', String(on));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', on ? '#1e1e1e' : '#e6e6e2');
};
switchButton?.addEventListener('click', () => {
  const on = root.dataset.on !== 'true';
  setPower(on);
  try { localStorage.setItem(storageKey, String(on)); } catch { /* Storage unavailable: the choice lasts for this visit. */ }
});
setPower(root.dataset.on === 'true');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-character-demo]').forEach(demo => {
  const range = demo.querySelector<HTMLInputElement>('[data-demo-range]');
  const status = demo.querySelector<HTMLElement>('[data-demo-status]');
  const panel = demo.querySelector<HTMLElement>('[role="tabpanel"]');
  const tabs = Array.from(demo.querySelectorAll<HTMLButtonElement>('[data-business-tab]'));
  const setPosition = (value: number) => demo.style.setProperty('--pos', `${value}%`);

  range?.addEventListener('input', () => setPosition(Number(range.value)));

  const select = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    demo.dataset.business = tab.dataset.businessTab;
    panel?.setAttribute('aria-labelledby', tab.id);
    if (focus) tab.focus();
    const name = demo.querySelector<HTMLElement>(`.cc-demo-caption [data-for="${tab.dataset.businessTab}"] strong`)?.textContent?.replace(/\.$/, '');
    if (status && name) status.textContent = `Showing ${name}.`;
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (event.key === 'Home') { event.preventDefault(); select(tabs[0], true); }
      else if (event.key === 'End') { event.preventDefault(); select(tabs[tabs.length - 1], true); }
      else if (step) { event.preventDefault(); select(tabs[(index + step + tabs.length) % tabs.length], true); }
    });
  });

  // A short sweep the first time the demo is seen hints that the divider can be dragged.
  if (!range || reducedMotion || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    const start = performance.now();
    const sweep = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      const value = 50 + Math.sin(t * Math.PI * 2) * 22 * (1 - t);
      setPosition(value);
      range.value = String(Math.round(value));
      if (t < 1) requestAnimationFrame(sweep);
    };
    requestAnimationFrame(sweep);
  }, { threshold: 0.6 });
  observer.observe(demo);
});
