// Motion for /concept/ (Motion library): the hero entrance, counting stats, scroll parallax, scroll reveals,
// the highlighter and step lines drawing in, pink full stops popping, and the footer wordmark rising letter by letter.
// It only runs when the visitor allows motion. Nothing is hidden until this script hides it, so content never depends on it.
import { animate, inView, scroll, stagger } from 'motion';

const ease = [.2, .7, .2, 1] as const;
const all = <T extends Element>(selector: string, scope: ParentNode = document) => Array.from(scope.querySelectorAll<T>(selector));

export const playMotion = () => {
  // Pink full stops start collapsed and pop once their headline is on screen.
  const stops = all<HTMLElement>('.cx-stop');
  stops.forEach(stop => { stop.style.transform = 'scale(0)'; });
  const pop = (stop: HTMLElement, delay: number) => {
    animate(stop, { scale: [0, 1.6, 1] }, { duration: .7, delay, ease: 'easeOut' });
  };

  // Hero: each line, the card and the feature strip arrive in turn, sharpening out of a blur.
  const steps = all<HTMLElement>('[data-hero-step]');
  steps.forEach(step => { step.style.animation = 'none'; step.style.opacity = '0'; });
  animate(steps, { opacity: [0, 1], y: [28, 0], filter: ['blur(10px)', 'blur(0px)'] }, { duration: .9, ease, delay: stagger(.08, { startDelay: .1 }) });
  const heroStop = document.querySelector<HTMLElement>('.cx-hero .cx-stop');
  if (heroStop) pop(heroStop, .75);

  // The studio's numbers count up from zero.
  all<HTMLElement>('[data-count]').forEach(element => {
    const [, prefix, digits, suffix] = element.textContent?.match(/^(\D*)([\d,]+)(.*)$/) ?? [];
    const target = Number(digits?.replace(/,/g, ''));
    if (!target) return;
    const show = (value: number) => { element.textContent = `${prefix}${Math.round(value).toLocaleString('en-US')}${suffix}`; };
    show(0);
    animate(0, target, { duration: 1.4, delay: .9, ease, onUpdate: show });
  });

  // As the page scrolls past the hero, the copy lifts and fades.
  const hero = document.querySelector<HTMLElement>('.cx-hero');
  const copy = document.querySelector<HTMLElement>('[data-hero-parallax]');
  if (hero && copy) scroll(animate(copy, { y: [0, -140], opacity: [1, .1] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });

  // Sections rise into view; items in a list follow one another.
  all<HTMLElement>('[data-reveal]').forEach(element => {
    const group = element.parentElement?.hasAttribute('data-stagger') ? element.parentElement : null;
    const delay = group ? Array.from(group.children).indexOf(element) * .1 : 0;
    element.style.opacity = '0';
    inView(element, () => {
      animate(element, { opacity: [0, 1], y: [24, 0] }, { duration: .8, delay, ease });
      all<HTMLElement>('.cx-stop', element).forEach(stop => pop(stop, delay + .45));
    }, { amount: .2 });
  });

  // The highlighter and the process lines draw across (CSS transitions, started here).
  all<HTMLElement>('.cx-mark, .cx-steps').forEach(element => {
    element.dataset.draw = '0';
    inView(element, () => { element.dataset.draw = '1'; }, { amount: .5 });
  });

  // The footer wordmark rises letter by letter.
  const mark = document.querySelector<HTMLElement>('.cx-footer-mark');
  if (mark) {
    const letters = all<HTMLElement>('span', mark);
    letters.forEach(letter => { letter.style.transform = 'translateY(105%)'; });
    inView(mark, () => {
      animate(letters, { y: ['105%', '0%'] }, { duration: .9, ease, delay: stagger(.05) });
      const stop = mark.querySelector<HTMLElement>('.cx-stop');
      if (stop) pop(stop, .6);
    }, { amount: .4 });
  }
};
