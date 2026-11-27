import { say } from '../../lib/i18n/bilingual';
import { ERROR_LANG, type Locale } from '../../lib/i18n/locales';
import { GREETING, TIPS } from '../../lib/mascot/mascot';
import { Mascot } from '../mascot/mascot';

/** Rays of the mandala half, as angles in degrees on the right side. */
const RAYS = [-75, -50, -25, 0, 25, 50, 75];

/** Circuit traces of the other half, each ending in a node. */
const TRACES = [
  { path: 'M196 92H150L118 60H78', end: [78, 60] },
  { path: 'M150 150H96L72 126H40', end: [40, 126] },
  { path: 'M140 210H44', end: [44, 210] },
  { path: 'M150 270H104L80 294H50', end: [50, 294] },
  { path: 'M196 330H158L124 364H92', end: [92, 364] },
] as const;

const CHIPS = [
  { word: 'kaam', x: 20, y: 8 },
  { word: 'agar', x: 304, y: 20 },
  { word: 'bolo()', x: 286, y: 340 },
];

/**
 * Mithu between the two halves of the logo: circuit on the left, mandala on the
 * right. The drawing is decoration; Mithu answers hovering and clicks.
 */
export function HeroArt({ locale }: { locale: Locale }) {
  const lang = ERROR_LANG[locale];
  return (
    <div className="hero-art">
      <svg viewBox="0 0 400 400" aria-hidden="true">
        <circle className="art-disc" cx="200" cy="200" r="132" />

        <g className="art-circuit">
          {TRACES.map(({ path, end: [x, y] }) => (
            <g key={path}>
              <path d={path} />
              <circle cx={x} cy={y} r="6" />
            </g>
          ))}
        </g>

        <g className="art-mandala" transform="translate(200 200)">
          {RAYS.map((angle) => (
            <g key={angle} transform={`rotate(${angle})`}>
              <path d="M140 0q20-14 40 0-20 14-40 0z" />
              <circle cx="192" cy="0" r="4" />
            </g>
          ))}
          <path className="art-arc" d="M0-150a150 150 0 0 1 0 300" />
        </g>

        {CHIPS.map(({ word, x, y }) => (
          <g key={word} className="art-chip" transform={`translate(${x} ${y})`}>
            <rect width="88" height="36" rx="10" />
            <text x="44" y="23">
              {word}
            </text>
          </g>
        ))}
      </svg>
      <div className="hero-mascot">
        <Mascot
          dismissible
          mood="idle"
          line={GREETING[lang]}
          tips={TIPS.map((tip) => say(tip, lang))}
          size={220}
        />
      </div>
    </div>
  );
}
