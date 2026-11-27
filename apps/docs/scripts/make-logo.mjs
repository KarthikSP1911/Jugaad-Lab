// Draws the logo as vector art on a transparent background: `public/logo.svg`,
// `public/logo-dark.svg`, `app/icon.svg` and the Apple touch icon.
import { Buffer } from 'node:buffer';
import { writeFile } from 'node:fs/promises';
import { URL, fileURLToPath } from 'node:url';
import sharp from 'sharp';

const path = (file) => fileURLToPath(new URL(`../${file}`, import.meta.url));
const round = (n) => Math.round(n * 10) / 10;

// Circuit half. Traced over enlarged crops, so each group maps crop pixels back to the canvas.

// [width, path data]
const topTraces = [
  [30, 'M920 100V420L960 466V635L995 675V1200'],
  [20, 'M998 236V420L960 466'],
  [28, 'M824 212V460L877 522V655L990 775'],
  [28, 'M710 133V347L752 398V495L807 553V675L990 865'],
  [28, 'M563 250V315L667 425V525L750 608'],
  [28, 'M432 332L595 497V550L990 955'],
  [28, 'M348 385L874 925'],
  [28, 'M329 488L478 640V690L530 737H690'],
  [20, 'M237 533L338 638H470'],
  [28, 'M237 646L332 747H450L505 805H655'],
  [28, 'M148 807H398L455 872H735L830 975'],
  [28, 'M281 926H672'],
  [28, 'M133 1030H470L515 990H995'],
  [20, 'M84 907H155L260 1025'],
];

const bottomTraces = [
  [30, 'M995 0V855'],
  [30, 'M133 130H465L560 163H995'],
  [28, 'M72 220H315'],
  [28, 'M300 220H500L560 163'],
  [26, 'M172 320L310 218'],
  [28, 'M787 230H610L553 292H432L400 322L260 480'],
  [20, 'M106 423H205L300 322H400'],
  [28, 'M790 292H655L578 373H500L345 525'],
  [28, 'M915 170L800 290L598 505V578L522 665V790'],
  [28, 'M970 205L662 535V715L634 748V803L520 925V1003'],
  [28, 'M650 380L530 498H495L358 650'],
  [20, 'M200 650H358'],
  [20, 'M456 548V688L400 748H345L292 800'],
  [20, 'M400 748V915'],
  [28, 'M810 462V535L752 598V775L710 830V945'],
  [24, 'M710 830L634 910V1075'],
  [28, 'M985 300L885 408V575L832 630V808'],
  [28, 'M985 395L945 440V635L910 675V1008'],
  [22, 'M900 820L831 888V1150'],
  [20, 'M912 878L992 945V1175'],
];

// [x, y, ring]: a ring has a hole, a pad is solid.
const topNodes = [
  [922, 98, true],
  [998, 236, false],
  [824, 212, true],
  [710, 133, true],
  [563, 250, true],
  [432, 332, true],
  [348, 385, false],
  [329, 488, true],
  [237, 533, false],
  [237, 646, true],
  [148, 807, true],
  [84, 907, false],
  [281, 926, true],
  [133, 1030, true],
];

const bottomNodes = [
  [72, 220, false],
  [172, 320, true],
  [106, 423, false],
  [260, 480, true],
  [345, 525, false],
  [200, 650, false],
  [358, 650, true],
  [292, 800, false],
  [402, 915, false],
  [520, 790, true],
  [520, 1003, false],
  [634, 1075, false],
  [710, 945, true],
  [831, 1150, false],
  [910, 1008, true],
  [992, 1175, false],
];

function circuit(offsetY, traces, nodes) {
  const lines = traces.map(([w, d]) => `<path stroke-width="${w}" d="${d}"/>`).join('');
  const dots = nodes
    .map(([x, y, ring]) =>
      ring
        ? `<circle cx="${x}" cy="${y}" r="26" fill="#000" stroke-width="25"/>`
        : `<circle cx="${x}" cy="${y}" r="37" fill="#fff" stroke="none" />`,
    )
    .join('');
  return `<g transform="translate(150 ${offsetY}) scale(.33333)">${lines}${dots}</g>`;
}

// The gradient is painted once through a mask, so it runs unbroken across both groups.
const circuitMask = `<mask id="circuit" maskUnits="userSpaceOnUse" x="140" y="100" width="370" height="800">
<g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">
${circuit(130, topTraces, topNodes)}
${circuit(430, bottomTraces, bottomNodes)}
</g></mask>`;

// Mandala half. Polar coordinates around the centre; angle 0 points up, clockwise, in degrees.

const point = (r, a) => {
  const t = (a * Math.PI) / 180;
  return `${round(r * Math.sin(t))} ${round(-r * Math.cos(t))}`;
};

const repeat = (from, step, count, shape) =>
  Array.from(
    { length: count },
    (_, i) => `<g transform="rotate(${from + step * i})">${shape}</g>`,
  ).join('');

const dot = (r, a, size, fill = '#fff') => {
  const [x, y] = point(r, a).split(' ');
  return `<circle cx="${x}" cy="${y}" r="${size}" fill="${fill}"/>`;
};

const line = (d, width, color = '#fff') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const fillPath = (d, color = '#fff') => `<path d="${d}" fill="${color}"/>`;

// A pointed arch standing on radius `base`, `half` degrees wide each side, peaking at `top`.
const arch = (base, top, half) =>
  `M${point(base, -half)}C${point((base + top) / 2 + 8, -half * 1.05)} ${point(top, -half * 0.7)} ${point(top, 0)}` +
  `C${point(top, half * 0.7)} ${point((base + top) / 2 + 8, half * 1.05)} ${point(base, half)}`;

// Scalloped silhouette of one 30 degree sector, tip in the middle.
const bigPetal =
  `M0 0L${point(300, -15)}` +
  `C${point(318, -13)} ${point(326, -11)} ${point(336, -9)}` +
  `C${point(362, -7.5)} ${point(358, -2.5)} ${point(386, 0)}` +
  `C${point(358, 2.5)} ${point(362, 7.5)} ${point(336, 9)}` +
  `C${point(326, 11)} ${point(318, 13)} ${point(300, 15)}Z`;

const petalDetail = [
  line(arch(240, 302, 10.5), 7),
  line(arch(240, 278, 6), 7),
  ...[-10.5, -7, -3.5, 0, 3.5, 7, 10.5].map((a) =>
    dot(316 + 18 * (1 - Math.abs(a) / 10.5), a, 4.2),
  ),
  dot(355, 0, 3),
].join('');

// The small cap that sits in each valley: an outlined shield with an arch and beads.
const capShape =
  `M${point(331, -5.4)}C${point(348, -6.6)} ${point(360, -6.2)} ${point(368, -5)}` +
  `Q${point(371, -1.6)} ${point(383, 0)}Q${point(371, 1.6)} ${point(368, 5)}` +
  `C${point(360, 6.2)} ${point(348, 6.6)} ${point(331, 5.4)}Q${point(339, 0)} ${point(331, -5.4)}Z`;

const cap = [
  `<path d="${capShape}" fill="none" stroke="url(#saffron)" stroke-width="5.5" stroke-linejoin="round"/>`,
  line(arch(336, 357, 3.2), 3.5, 'url(#saffron)'),
  line(arch(336, 347, 1.4), 3, 'url(#saffron)'),
  ...[
    [356, -4.1],
    [364, -2.2],
    [370, 0],
    [364, 2.2],
    [356, 4.1],
  ].map(([r, a]) => dot(r, a, 2.4, 'url(#saffron)')),
].join('');

const teardrop =
  `M${point(281, 0)}C${point(266, 3.6)} ${point(242, 4)} ${point(244, 0)}` +
  `C${point(242, -4)} ${point(266, -3.6)} ${point(281, 0)}Z`;
const tearCut = line(teardrop, 6) + dot(255, 0, 2);

// Rounded leaf pointing outwards from `from` to `to`.
const leaf = (from, to, half) => {
  const mid = from + (to - from) * 0.45;
  return (
    `M${point(from, 0)}C${point(mid - 12, half)} ${point(mid + 14, half)} ${point(to, 0)}` +
    `C${point(mid + 14, -half)} ${point(mid - 12, -half)} ${point(from, 0)}Z`
  );
};

// Three-tongued flame between the leaves of the inner flower.
const flame =
  `M${point(137, -6)}Q${point(152, -9)} ${point(158, -7.5)}Q${point(154, -4)} ${point(160, -3.5)}` +
  `Q${point(163, -1)} ${point(176, 0)}Q${point(163, 1)} ${point(160, 3.5)}` +
  `Q${point(154, 4)} ${point(158, 7.5)}Q${point(152, 9)} ${point(137, 6)}Q${point(146, 0)} ${point(137, -6)}Z`;

const scallopRing = (r, bulge, step) => {
  let d = `M${point(r, 0)}`;
  for (let a = 0; a < 360; a += step)
    d += `Q${point(r + bulge, a + step / 2)} ${point(r, a + step)}`;
  return `${d}Z`;
};

const mandala = [
  `<g fill="url(#saffron)">${repeat(0, 30, 7, `<path d="${bigPetal}"/>`)}<circle r="302"/></g>`,
  // Outer petals, valleys and caps.
  repeat(0, 30, 7, petalDetail),
  repeat(15, 30, 6, tearCut + cap),
  // Beaded band.
  '<circle r="233" fill="none" stroke="#fff" stroke-width="7"/>',
  repeat(3.75, 7.5, 24, `<ellipse cy="-211" rx="4.4" ry="8" fill="#fff"/>`),
  '<circle r="189" fill="none" stroke="#fff" stroke-width="6.5"/>',
  // Ring of large leaves with flames between them.
  repeat(0, 30, 7, line(leaf(133, 182, 9.5), 5.5) + fillPath(leaf(146, 168, 3.2))),
  repeat(15, 30, 6, fillPath(flame) + dot(182, 0, 3.4)),
  // Scalloped collar.
  line(scallopRing(118, 17, 15), 5.5),
  repeat(7.5, 15, 12, dot(116, 0, 3.6)),
  // Inner petals.
  repeat(0, 30, 7, fillPath(leaf(66, 108, 11))),
  repeat(15, 30, 6, line(leaf(70, 106, 8.5), 4.5)),
  // Centre flower.
  '<circle r="59" fill="none" stroke="#fff" stroke-width="6"/>',
  line(scallopRing(41, 9, 30), 5),
  fillPath(scallopRing(19, 12, 45)),
  '<circle r="9" fill="url(#saffron)"/>',
].join('\n');

// The circuit's gradient stops, from centre to edge. Dark pages need lighter blues.
const lightStops = ['#1687c4', '#14609f', '#172d6c', '#182561'];
const darkStops = ['#6fd3f5', '#55b4ee', '#7f9ff0', '#8ea6ee'];

const draw = ([a, b, c, d]) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="114 90 808 808">
<title>Jugaad Hinglish</title>
<defs>
<radialGradient id="saffron" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="375">
<stop offset="0" stop-color="#fbb731"/><stop offset=".35" stop-color="#f8921d"/>
<stop offset=".65" stop-color="#f26a12"/><stop offset="1" stop-color="#e0500f"/>
</radialGradient>
<radialGradient id="navy" gradientUnits="userSpaceOnUse" cx="495" cy="466" r="270">
<stop offset="0" stop-color="${a}"/><stop offset=".35" stop-color="${b}"/>
<stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="${d}"/>
</radialGradient>
<clipPath id="right"><rect x="0" y="-400" width="400" height="800"/></clipPath>
${circuitMask}
</defs>
<rect x="140" y="100" width="370" height="800" fill="url(#navy)" mask="url(#circuit)"/>
<g transform="translate(502 494)" clip-path="url(#right)">
${mandala}
</g>
</svg>
`;

const svg = draw(lightStops);
// A favicon cannot read the page theme, so it follows the system setting.
const darkIconStyle = `<style>@media (prefers-color-scheme: dark){${darkStops
  .map((color, i) => `#navy stop:nth-child(${i + 1}){stop-color:${color}}`)
  .join('')}}</style>`;

await writeFile(path('public/logo.svg'), svg);
await writeFile(path('public/logo-dark.svg'), draw(darkStops));
await writeFile(
  path('app/icon.svg'),
  svg.replace(
    '<defs>',
    `${darkIconStyle}
<defs>`,
  ),
);

// iOS ignores SVG touch icons and fills transparency with black.
await sharp(Buffer.from(svg), { density: 192 })
  .resize(180, 180)
  .flatten({ background: '#ffffff' })
  .png({ compressionLevel: 9 })
  .toFile(path('app/apple-icon.png'));
