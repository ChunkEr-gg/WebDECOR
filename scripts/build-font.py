"""Builds WebDECOR Display, the studio's own display typeface, into public/fonts/webdecor-display.woff2.

Each glyph is drawn as a centreline on a shared grid, then stroked with square ends and round joins,
merged into one outline and compiled into a font. The letterforms grow out of the WebDECOR section
wordmark: monoline strokes, softened corners, a flat-topped A and V, and a slab I.

There are two weights drawn from the same centrelines: Regular (webdecor-display.woff2) and Light
(webdecor-display-light.woff2), which only changes the stroke. The vertical metrics stay the same, so
the weights line up.

Requires: pip install fonttools skia-pathops brotli
Run from the repository root: python3 scripts/build-font.py           (both weights)
                          or: python3 scripts/build-font.py light     (one weight)
"""
import re
import subprocess
import sys
from pathlib import Path

import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen

UPM = 1000
# weight name: (stroke in font units, OS/2 weight class, style name, file name)
WEIGHTS = {'regular': (112, 700, 'Regular', 'webdecor-display.woff2'),
           'light': (52, 300, 'Light', 'webdecor-display-light.woff2')}
WEIGHT = sys.argv[1] if len(sys.argv) > 1 else None
STROKE, WEIGHT_CLASS, STYLE, FILE = WEIGHTS[WEIGHT or 'regular']
BIG, SMALL = 230, 56              # leaf corners: top-left and bottom-right curves, then the other two
HALF = STROKE // 2
CAP, XH, ASC, DESC = 700, 520, 740, -200
T, B, MID = CAP - HALF, HALF, 350          # capital centrelines: top, baseline, middle
XT = XH - HALF                             # x-height centreline
AT, DT = ASC - HALF, DESC + HALF           # ascender and descender centrelines
R, RX = 170, 150                           # corner radius for capitals and lowercase
SIDE, ROUND_SIDE = 60, 38                  # side bearings for straight and round sides


def rr(x0, y0, x1, y1, r):
    """A closed rectangle with softened corners, drawn as a centreline."""
    return (f'M{x0 + r},{y1} H{x1 - r} Q{x1},{y1} {x1},{y1 - r} V{y0 + r} Q{x1},{y0} {x1 - r},{y0} '
            f'H{x0 + r} Q{x0},{y0} {x0},{y0 + r} V{y1 - r} Q{x0},{y1} {x0 + r},{y1} Z')


def dot(x, y):
    """A square dot: a short stroke whose square ends fill it out."""
    return f'M{x},{y - 5} V{y + 5}'


# name: (unicode characters, centreline width, [paths], (left side, right side))
G = {}


def glyph(chars, width, paths, sides=(SIDE, SIDE)):
    for char in chars:
        G[char] = (width, paths if isinstance(paths, list) else [paths], sides)


S, Rd = SIDE, ROUND_SIDE

# Capitals
glyph('A', 560, [f'M0,{B} L140,{T} H420 L560,{B}', f'M50,{MID - 30} H510'], (24, 24))
glyph('B', 500, [f'M0,{B} V{T} H350 Q500,{T} 500,500 Q500,{MID} 350,{MID} H0',
                 f'M350,{MID} Q500,{MID} 500,200 Q500,{B} 350,{B} H0'], (S, Rd))
glyph('C', 520, f'M520,{T} H{R} Q0,{T} 0,{T - R} V{B + R} Q0,{B} {R},{B} H520', (Rd, S))
glyph('D', 540, f'M0,{B} V{T} H{540 - R} Q540,{T} 540,{T - R} V{B + R} Q540,{B} {540 - R},{B} Z', (S, Rd))
glyph('E', 460, [f'M460,{T} H0 V{B} H460', f'M0,{MID} H380'])
glyph('F', 440, [f'M0,{B} V{T} H440', f'M0,{MID} H360'])
glyph('G', 540, f'M540,{T} H{R} Q0,{T} 0,{T - R} V{B + R} Q0,{B} {R},{B} H540 V320 H320', (Rd, S))
glyph('H', 520, [f'M0,{B} V{T}', f'M520,{B} V{T}', f'M0,{MID} H520'])
glyph('I', 320, [f'M0,{T} H320', f'M160,{T} V{B}', f'M0,{B} H320'])
glyph('J', 440, f'M440,{T} V{B + R} Q440,{B} {440 - R},{B} H0', (40, S))
glyph('K', 520, [f'M0,{B} V{T}', f'M520,{T} L60,{MID} L520,{B}'], (S, 24))
glyph('L', 420, f'M0,{T} V{B} H420', (S, 30))
glyph('M', 640, f'M0,{B} V{T} L320,250 L640,{T} V{B}')
glyph('N', 540, f'M0,{B} V{T} L540,{B} V{T}')
glyph('O', 580, rr(0, B, 580, T, R), (Rd, Rd))
glyph('P', 500, f'M0,{B} V{T} H350 Q500,{T} 500,490 Q500,330 350,330 H0', (S, Rd))
glyph('Q', 580, [rr(0, B, 580, T, R), 'M420,190 L600,0'], (Rd, Rd))
glyph('R', 520, [f'M0,{B} V{T} H370 Q520,{T} 520,490 Q520,330 370,330 H0', f'M330,290 L520,{B}'], (S, 30))
glyph('S', 500, f'M500,{T} H150 Q0,{T} 0,500 Q0,{MID} 150,{MID} H350 Q500,{MID} 500,200 Q500,{B} 350,{B} H0', (40, 40))
glyph('T', 520, [f'M0,{T} H520', f'M260,{T} V{B}'], (24, 24))
glyph('U', 540, f'M0,{T} V{B + R} Q0,{B} {R},{B} H{540 - R} Q540,{B} 540,{B + R} V{T}')
glyph('V', 560, f'M0,{T} L210,{B} H350 L560,{T}', (24, 24))
glyph('W', 760, f'M0,{T} L150,{B} L380,520 L610,{B} L760,{T}', (24, 24))
glyph('X', 520, [f'M0,{T} L520,{B}', f'M520,{T} L0,{B}'], (24, 24))
glyph('Y', 540, [f'M0,{T} L270,330 L540,{T}', f'M270,330 V{B}'], (24, 24))
glyph('Z', 500, f'M0,{T} H500 L0,{B} H500', (40, 40))

# Lowercase
glyph('a', 440, [rr(0, B, 440, XT, RX), f'M440,{XT} V{B}'], (Rd, S))
glyph('b', 440, [rr(0, B, 440, XT, RX), f'M0,{AT} V{B}'], (S, Rd))
glyph('c', 400, f'M400,{XT} H{RX} Q0,{XT} 0,{XT - RX} V{B + RX} Q0,{B} {RX},{B} H400', (Rd, 40))
glyph('d', 440, [rr(0, B, 440, XT, RX), f'M440,{AT} V{B}'], (Rd, S))
glyph('e', 440, f'M0,260 H440 V{XT - RX} Q440,{XT} {440 - RX},{XT} H{RX} Q0,{XT} 0,{XT - RX} V{B + RX} Q0,{B} {RX},{B} H430', (Rd, 40))
glyph('f', 260, [f'M300,{AT} H170 Q60,{AT} 60,{AT - 110} V{B}', f'M0,{XT} H260'], (30, 10))
glyph('g', 440, [rr(0, B, 440, XT, RX), f'M440,{XT} V{DT + RX} Q440,{DT} {440 - RX},{DT} H20'], (Rd, S))
glyph('h', 440, [f'M0,{AT} V{B}', f'M0,{XT} H{440 - RX} Q440,{XT} 440,{XT - RX} V{B}'])
glyph('i', 0, [f'M0,{XT} V{B}', dot(0, 645)])
glyph('j', 160, [f'M160,{XT} V{DT + 110} Q160,{DT} 50,{DT} H-40', dot(160, 645)], (20, S))
glyph('k', 400, [f'M0,{AT} V{B}', f'M400,{XT} L60,250 L400,{B}'], (S, 24))
glyph('l', 140, f'M0,{AT} V{B + 110} Q0,{B} 110,{B} H140', (S, 30))
glyph('m', 620, [f'M0,{B} V{XT} H200 Q310,{XT} 310,{XT - 110} V{B}', f'M310,{XT - 110} Q310,{XT} 420,{XT} H510 Q620,{XT} 620,{XT - 110} V{B}'])
glyph('n', 420, f'M0,{B} V{XT} H{420 - RX} Q420,{XT} 420,{XT - RX} V{B}')
glyph('o', 460, rr(0, B, 460, XT, RX), (Rd, Rd))
glyph('p', 440, [rr(0, B, 440, XT, RX), f'M0,{XT} V{DT}'], (S, Rd))
glyph('q', 440, [rr(0, B, 440, XT, RX), f'M440,{XT} V{DT}'], (Rd, S))
glyph('r', 270, f'M0,{B} V{XT - RX} Q0,{XT} {RX},{XT} H270', (S, 20))
glyph('s', 400, f'M400,{XT} H110 Q0,{XT} 0,365 Q0,260 110,260 H290 Q400,260 400,155 Q400,{B} 290,{B} H0', (36, 36))
glyph('t', 240, [f'M80,{AT - 40} V{B + 100} Q80,{B} 180,{B} H240', f'M0,{XT} H240'], (30, 24))
glyph('u', 420, [f'M0,{XT} V{B + RX} Q0,{B} {RX},{B} H420', f'M420,{XT} V{B}'])
glyph('v', 440, f'M0,{XT} L165,{B} H275 L440,{XT}', (20, 20))
glyph('w', 640, f'M0,{XT} L120,{B} L320,380 L520,{B} L640,{XT}', (20, 20))
glyph('x', 420, [f'M0,{XT} L420,{B}', f'M420,{XT} L0,{B}'], (20, 20))
glyph('y', 420, [f'M0,{XT} V{B + RX} Q0,{B} {RX},{B} H420', f'M420,{XT} V{DT + RX} Q420,{DT} {420 - RX},{DT} H10'])
glyph('z', 400, f'M0,{XT} H400 L0,{B} H400', (36, 36))

# Figures
glyph('0', 500, rr(0, B, 500, T, R), (Rd, Rd))
glyph('1', 340, [f'M0,560 L170,{T} V{B}', f'M0,{B} H340'], (40, 40))
glyph('2', 480, f'M0,{T} H330 Q480,{T} 480,500 Q480,{MID} 330,{MID} H150 Q0,{MID} 0,200 V{B} H480', (40, 40))
glyph('3', 480, [f'M0,{T} H330 Q480,{T} 480,500 Q480,{MID} 330,{MID} H120', f'M330,{MID} Q480,{MID} 480,200 Q480,{B} 330,{B} H0'], (40, Rd))
glyph('4', 520, [f'M380,{B} V{T} L0,220 H520'], (30, 30))
glyph('5', 480, f'M480,{T} H0 V380 H330 Q480,380 480,215 Q480,{B} 330,{B} H0', (40, Rd))
glyph('6', 480, [rr(0, B, 480, 380, 150), f'M0,215 V500 Q0,{T} 150,{T} H460'], (Rd, Rd))
glyph('7', 480, f'M0,{T} H480 L150,{B}', (40, 30))
glyph('8', 500, [rr(20, MID, 480, T, 140), rr(0, B, 500, MID, 150)], (Rd, Rd))
glyph('9', 480, [rr(0, 320, 480, T, 150), f'M480,485 V200 Q480,{B} 330,{B} H20'], (Rd, Rd))

# Punctuation and symbols
glyph('.', 0, dot(0, 55), (50, 50))
glyph(',', 40, 'M40,80 L0,-80', (40, 50))
glyph(':', 0, [dot(0, 55), dot(0, 415)], (50, 50))
glyph(';', 40, ['M40,80 L0,-80', dot(40, 415)], (40, 50))
glyph('!', 0, [f'M0,{T} V250', dot(0, 55)], (60, 60))
glyph('?', 420, [f'M0,{T} H270 Q420,{T} 420,520 Q420,390 270,390 H210 V250', dot(210, 55)], (40, 40))
glyph("'’", 0, f'M0,{T} V520', (50, 50))
glyph('"“”', 140, [f'M0,{T} V520', f'M140,{T} V520'], (50, 50))
glyph('-', 220, 'M0,300 H220', (40, 40))
glyph('–', 420, 'M0,300 H420', (40, 40))
glyph('—', 760, 'M0,300 H760', (30, 30))
glyph('/', 320, f'M0,{B - 60} L320,{T + 60}', (20, 20))
glyph('(', 120, f'M120,{T + 50} H100 Q0,{T + 50} 0,{T - 50} V{B - 50} Q0,{B - 150} 100,{B - 150} H120', (S, 20))
glyph(')', 120, f'M0,{T + 50} H20 Q120,{T + 50} 120,{T - 50} V{B - 50} Q120,{B - 150} 20,{B - 150} H0', (20, S))
glyph('+', 380, ['M0,330 H380', 'M190,140 V520'], (40, 40))
glyph('=', 380, ['M0,250 H380', 'M0,420 H380'], (40, 40))
glyph('$', 500, [f'M500,{T} H150 Q0,{T} 0,500 Q0,{MID} 150,{MID} H350 Q500,{MID} 500,200 Q500,{B} 350,{B} H0', f'M250,{T + 90} V{B - 90}'], (40, 40))
glyph('×', 300, ['M0,180 L300,480', 'M300,180 L0,480'], (40, 40))
glyph('·', 0, dot(0, 330), (50, 50))

SPACE = 260


def parse(commands):
    """Reads a small absolute SVG path subset (M L H V Q Z) into subpaths of vertices.

    A quadratic curve marks its control point as a corner to soften; the rounding itself is
    applied afterwards, so every corner follows the same rule."""
    tokens = re.findall(r'[MLHVQZ]|-?\d+(?:\.\d+)?', commands)
    subpaths, current, i, x, y, cmd = [], None, 0, 0.0, 0.0, None
    while i < len(tokens):
        if tokens[i] in 'MLHVQZ':
            cmd = tokens[i]; i += 1
            if cmd == 'Z':
                current['closed'] = True; continue
        nums = [float(v) for v in tokens[i:i + (4 if cmd == 'Q' else 2 if cmd in 'ML' else 1)]]
        if cmd == 'M':
            x, y = nums; i += 2; current = {'points': [[x, y, False]], 'closed': False}; subpaths.append(current); cmd = 'L'
        elif cmd == 'L':
            x, y = nums; i += 2; current['points'].append([x, y, False])
        elif cmd == 'H':
            x = nums[0]; i += 1; current['points'].append([x, y, False])
        elif cmd == 'V':
            y = nums[0]; i += 1; current['points'].append([x, y, False])
        elif cmd == 'Q':
            cx, cy, x, y = nums; i += 4
            current['points'].append([cx, cy, True])
            current['points'].append([x, y, False])
    for sub in subpaths:
        sub['points'] = simplify_points(sub['points'], sub['closed'])
    return subpaths


def collinear(a, b, c):
    return abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) < 1e-6


def simplify_points(points, closed):
    """Drops repeated points and the tangent points left between corners, keeping the ends of open paths."""
    out = []
    for p in points:
        if out and abs(out[-1][0] - p[0]) < 1e-6 and abs(out[-1][1] - p[1]) < 1e-6:
            out[-1][2] = out[-1][2] or p[2]; continue
        out.append(list(p))
    if closed and len(out) > 1 and abs(out[0][0] - out[-1][0]) < 1e-6 and abs(out[0][1] - out[-1][1]) < 1e-6:
        out[0][2] = out[0][2] or out[-1][2]; out.pop()
    changed = True
    while changed:
        changed = False
        n = len(out)
        for k in range(n):
            if not closed and (k == 0 or k == n - 1):
                continue
            a, b, c = out[(k - 1) % n], out[k], out[(k + 1) % n]
            if not b[2] and collinear(a, b, c):
                out.pop(k); changed = True; break
    return out


def corner_radius(prev, v, nxt):
    """The leaf rule: generous curves on the top-left and bottom-right corners, tight ones on the others."""
    dirs = {(1 if p[0] > v[0] + 1e-6 else -1 if p[0] < v[0] - 1e-6 else 0, 1 if p[1] > v[1] + 1e-6 else -1 if p[1] < v[1] - 1e-6 else 0) for p in (prev, nxt)}
    east, west = any(d[0] == 1 for d in dirs), any(d[0] == -1 for d in dirs)
    north, south = any(d[1] == 1 for d in dirs), any(d[1] == -1 for d in dirs)
    if (east and south) or (west and north):   # top-left or bottom-right corner of a shape
        return BIG
    return SMALL


def to_skia(commands):
    path = pathops.Path()
    for sub in parse(commands):
        pts, closed = sub['points'], sub['closed']
        n = len(pts)
        dist = lambda a, b: ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** .5
        radius = {}
        for k, p in enumerate(pts):
            if p[2] and (closed or 0 < k < n - 1):
                radius[k] = corner_radius(pts[(k - 1) % n], p, pts[(k + 1) % n])
        # Corners that share an edge split its length between them.
        for k in list(radius):
            for j in ((k - 1) % n, (k + 1) % n):
                if not closed and (j < 0 or j >= n):
                    continue
                length = dist(pts[k], pts[j])
                if j in radius:
                    total = radius[k] + radius[j]
                    if total > length:
                        radius[k] = min(radius[k], radius[k] * length / total)
                else:
                    radius[k] = min(radius[k], length)

        def toward(a, b, r):
            d = dist(a, b)
            return (a[0] + (b[0] - a[0]) * r / d, a[1] + (b[1] - a[1]) * r / d)

        def start_point(k):
            return toward(pts[k], pts[(k + 1) % n], radius[k]) if k in radius else (pts[k][0], pts[k][1])

        first = 0
        if closed:
            path.moveTo(*start_point(0))
            order = list(range(1, n)) + [0]
        else:
            path.moveTo(pts[0][0], pts[0][1])
            order = list(range(1, n))
        for k in order:
            p = pts[k]
            if k in radius:
                prev, nxt = pts[(k - 1) % n], pts[(k + 1) % n]
                path.lineTo(*toward(p, prev, radius[k]))
                path.quadTo(p[0], p[1], *toward(p, nxt, radius[k]))
            else:
                path.lineTo(p[0], p[1])
        if closed:
            path.close()
    return path


def outline(paths):
    """Strokes each centreline and merges the results into one clean outline."""
    merged = pathops.Path()
    for commands in paths:
        stroked = to_skia(commands)
        stroked.stroke(STROKE, pathops.LineCap.SQUARE_CAP, pathops.LineJoin.ROUND_JOIN, 4)
        stroked.convertConicsToQuads()
        merged.addPath(stroked)
    return pathops.simplify(merged, fix_winding=True, clockwise=True)


def build(out_dir: Path):
    order = ['.notdef', 'space']
    cmap = {32: 'space'}
    glyphs, metrics = {}, {}

    notdef = TTGlyphPen(None)
    for contour in ([(60, 0), (60, CAP), (440, CAP), (440, 0)], [(110, 50), (390, 50), (390, CAP - 50), (110, CAP - 50)]):
        notdef.moveTo(contour[0])
        for point in contour[1:]:
            notdef.lineTo(point)
        notdef.closePath()
    glyphs['.notdef'], metrics['.notdef'] = notdef.glyph(), (500, 60)
    glyphs['space'], metrics['space'] = TTGlyphPen(None).glyph(), (SPACE, 0)

    for char, (width, paths, (left, right)) in G.items():
        name = f'uni{ord(char):04X}'
        shape = outline(paths)
        x_min = shape.bounds[0] if shape.bounds else 0
        x_max = shape.bounds[2] if shape.bounds else width
        dx = left - x_min                      # place the ink's left edge at the left side bearing
        pen = TTGlyphPen(None)
        shape.draw(Cu2QuPen(TransformPen(pen, (1, 0, 0, 1, round(dx), 0)), max_err=1, reverse_direction=False))
        glyphs[name] = pen.glyph()
        metrics[name] = (round(x_max - x_min + left + right), left)
        order.append(name)
        cmap[ord(char)] = name

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASC + 60, descent=DESC - 40)
    full_name = 'WebDECOR Display' + ('' if STYLE == 'Regular' else f' {STYLE}')
    fb.setupNameTable({'familyName': 'WebDECOR Display', 'styleName': STYLE, 'uniqueFontIdentifier': f'WebDECOR Display {STYLE} 1.0',
                       'fullName': full_name, 'psName': f'WebDECORDisplay-{STYLE}', 'version': 'Version 1.000',
                       'copyright': 'Copyright 2026 WebDECOR'})
    fb.setupOS2(sTypoAscender=ASC + 60, sTypoDescender=DESC - 40, sTypoLineGap=0, usWinAscent=ASC + 80, usWinDescent=-(DESC - 60),
                sxHeight=XH, sCapHeight=CAP, achVendID='WDEC', usWeightClass=WEIGHT_CLASS, fsSelection=0x40)
    fb.setupPost()
    fb.font.flavor = 'woff2'
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / FILE
    fb.save(target)
    print(f'{target} ({target.stat().st_size} bytes, {len(order)} glyphs)')


if __name__ == '__main__':
    if WEIGHT is None:
        # The glyph table is built from module-level constants, so each weight runs in its own process.
        for name in WEIGHTS:
            subprocess.run([sys.executable, __file__, name], check=True)
    else:
        build(Path(__file__).resolve().parent.parent / 'public' / 'fonts')
