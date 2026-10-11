import { iconPaths, type IconName } from '../data/icons';
export function createIcon(name: IconName): SVGSVGElement {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  const attributes = { class: 'wd-icon', width: '1em', height: '1em', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.65', 'stroke-linecap': 'square', 'stroke-linejoin': 'miter', 'aria-hidden': 'true', focusable: 'false' };
  Object.entries(attributes).forEach(([key,value])=>svg.setAttribute(key,value));
  svg.style.display='inline-block'; svg.style.verticalAlign='-.125em'; svg.style.flexShrink='0';
  iconPaths[name].forEach(d=>{ const path=document.createElementNS(namespace,'path'); path.setAttribute('d',d); svg.appendChild(path); });
  return svg;
}
