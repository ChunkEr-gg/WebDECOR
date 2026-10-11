const menu = document.querySelector<HTMLDetailsElement>('[data-header-menu]');
if (menu) {
  const trigger = menu.querySelector<HTMLElement>('summary')!;
  menu.addEventListener('toggle', () => {
    trigger.setAttribute('aria-label', menu.open ? 'Close navigation' : 'Open navigation');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      trigger.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
  });
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) menu.open = false;
  });
  const desktop = window.matchMedia('(min-width:601px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) menu.open = false;
  });
}
export {};
