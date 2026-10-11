// Project the live page onto the four corners of the photographed CRT glass.
const monitor = document.querySelector<HTMLElement>('.u-monitor');
const screen = monitor?.querySelector<HTMLElement>('.u-live-screen');
if (monitor && screen) {
  const fit = () => {
    const points = (monitor.dataset.screenQuad || '.132,.147,.628,.129,.612,.636,.113,.597').split(',').map(Number);
    const width = monitor.clientWidth;
    const [x0,y0,x1,y1,x2,y2,x3,y3] = points.map(value => value * width);
    const dx1=x1-x2, dx2=x3-x2, dx3=x0-x1+x2-x3;
    const dy1=y1-y2, dy2=y3-y2, dy3=y0-y1+y2-y3;
    const determinant=dx1*dy2-dx2*dy1;
    const g=(dx3*dy2-dx2*dy3)/determinant;
    const h=(dx1*dy3-dx3*dy1)/determinant;
    const sw=560, sh=430;
    const a=(x1-x0+g*x1)/sw, b=(x3-x0+h*x3)/sh;
    const d=(y1-y0+g*y1)/sw, e=(y3-y0+h*y3)/sh;
    screen.style.transform=`matrix3d(${a},${d},0,${g/sw},${b},${e},0,${h/sh},0,0,1,0,${x0},${y0},0,1)`;
  };
  new ResizeObserver(fit).observe(monitor);
  fit();
}
