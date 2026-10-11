const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

if (document.documentElement.dataset.world === 'cybercore') {
  const namespace = 'http://www.w3.org/2000/svg';
  let overlay: HTMLDivElement | undefined;
  let chargedLogo: HTMLAnchorElement | undefined;
  let finish: ReturnType<typeof setTimeout> | undefined;
  let destination: string | undefined;

  function clear() {
    clearTimeout(finish);
    overlay?.remove();
    chargedLogo?.classList.remove('wd-logo-is-surging');
    overlay = undefined;
    chargedLogo = undefined;
    destination = undefined;
  }

  function complete() {
    const next = destination;
    clear();
    if (next) window.location.assign(next);
  }

  document.querySelectorAll<HTMLAnchorElement>('a[data-logo-surge]').forEach(logo => {
    logo.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reduced.matches) return;
      const target = new URL(logo.href);
      if (target.origin !== window.location.origin) return;
      event.preventDefault();
      clear();

      const bounds = logo.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const height = window.innerHeight;
      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;
      const svg = document.createElementNS(namespace, 'svg');
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('focusable', 'false');
      const endpoints = [[width * .95, y + 12], [width * .88, height * .36], [width * .72, height * .74], [width * .37, height * .88], [width * .06, height * .6], [width * .58, 16]];
      endpoints.forEach(([endX, endY], branch) => {
        const dx = endX - x, dy = endY - y;
        const length = Math.hypot(dx, dy) || 1;
        const points = Array.from({length: 9}, (_, i) => {
          const t = i / 8;
          const jitter = i === 0 || i === 8 ? 0 : (i % 2 ? 1 : -1) * Math.min(24, length * .035) * Math.sin(t * Math.PI);
          return `${x + dx * t - dy / length * jitter} ${y + dy * t + dx / length * jitter}`;
        });
        for (const layer of ['glow', 'core']) {
          const path = document.createElementNS(namespace, 'path');
          path.setAttribute('d', `M ${points.join(' L ')}`);
          path.setAttribute('pathLength', '100');
          path.setAttribute('class', `wd-logo-arc-${layer}`);
          path.style.animationDelay = `${branch * 18}ms`;
          svg.appendChild(path);
        }
      });

      overlay = document.createElement('div');
      overlay.className = 'wd-logo-surge';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.setProperty('--surge-x', `${x}px`);
      overlay.style.setProperty('--surge-y', `${y}px`);
      const wave = document.createElement('div');
      wave.className = 'wd-logo-surge-wave';
      overlay.append(wave, svg);
      document.body.appendChild(overlay);
      chargedLogo = logo;
      logo.classList.add('wd-logo-is-surging');
      if (target.pathname !== window.location.pathname || target.search !== window.location.search) destination = target.href;
      else window.scrollTo({top: 0, behavior: 'smooth'});
      finish = setTimeout(complete, 680);
    });
  });

  reduced.addEventListener('change', () => {if (reduced.matches) complete();});
  window.addEventListener('pagehide', clear);
}

export {};
