import { useId } from 'react';
import type { Pose } from '../../lib/mascot/mascot';

interface Props {
  pose: Pose;
  size: number;
  /** Faces left instead of right. */
  flip?: boolean;
}

/** Mithu the parrot, in the logo's colours. The pose picks the CSS animation. */
export function Parrot({ pose, size, flip = false }: Props) {
  // Several parrots can share a page, so gradient names must not collide.
  const id = useId().replace(/\W/g, '');
  const blue = `url(#${id}-blue)`;
  const navy = `url(#${id}-navy)`;
  const saffron = `url(#${id}-saffron)`;
  return (
    <svg
      className={`parrot parrot-${pose}`}
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-blue`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#25a0dc" />
          <stop offset="1" stopColor="#1a4a8f" />
        </linearGradient>
        <linearGradient id={`${id}-navy`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2660ac" />
          <stop offset="1" stopColor="#182561" />
        </linearGradient>
        <linearGradient id={`${id}-saffron`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbb731" />
          <stop offset="1" stopColor="#ee5f10" />
        </linearGradient>
      </defs>
      <g {...(flip ? { transform: 'matrix(-1 0 0 1 120 0)' } : {})}>
        <path className="parrot-perch" d="M26 116h82" />
        <circle className="parrot-node" cx="110" cy="116" r="4" />
        <g className="parrot-bird">
          <g className="parrot-tail">
            <path d="M46 88C32 96 20 106 12 114q7 4 15 1l27-16z" fill={saffron} />
            <path d="M50 94C38 106 28 116 22 126q10 1 15-5l23-20z" fill={navy} />
            <path d="M58 98c-8 10-13 20-14 30q9-3 13-10l11-18z" fill={blue} />
          </g>
          <path
            className="parrot-wing-back"
            d="M80 62c13 6 18 22 12 34-9-5-16-17-17-30z"
            fill={navy}
          />
          <path d="M63 40c28 1 35 36 24 58-8 15-35 16-45 2-13-20-7-58 21-60z" fill={blue} />
          <path d="M72 58c17 8 20 34 1 48-15-9-17-34-1-48z" fill={saffron} />
          <path className="parrot-scallop" d="M66 76q5 5 10 0t10 0M68 88q5 5 9 0t8 0" />
          <g className="parrot-head">
            <g className="parrot-crest">
              <path d="M58 20C50 12 50 5 55 2c1 7 6 10 11 13z" fill={saffron} />
              <path d="M66 17c-2-9 2-14 8-15-3 6 0 11 2 16z" fill={saffron} />
            </g>
            <circle cx="66" cy="40" r="26" fill={blue} />
            <circle className="parrot-white" cx="73" cy="36" r="11" />
            <g className="parrot-eye">
              <g className="parrot-look">
                <circle className="parrot-pupil" cx="75" cy="36" r="5" />
                <circle className="parrot-white" cx="77" cy="34" r="1.6" />
              </g>
            </g>
            <path className="parrot-lid" d="M68 36q7 7 14 0" />
            <path className="parrot-jaw" d="M83 50c4 1 8 0 10-3-1 8-6 12-12 9z" />
            <path className="parrot-beak" d="M83 33c13-2 21 8 16 21-2-6-8-6-17-5z" />
          </g>
          <g className="parrot-wing">
            <path d="M46 62c-17 8-21 31-10 47 15-5 24-22 22-40-1-6-6-9-12-7z" fill={navy} />
            <path className="parrot-feather" d="M38 84q8 2 15-4M35 94q8 2 15-4M35 103q6 0 11-4" />
          </g>
          <path
            className="parrot-feet"
            d="M54 106v7m-6 6c0-8 12-8 12 0m-6-6v6M74 106v7m-6 6c0-8 12-8 12 0m-6-6v6"
          />
        </g>
      </g>
      {pose === 'sleeping' && (
        <g className="parrot-zzz" transform={flip ? 'translate(4 22)' : 'translate(96 22)'}>
          <text x="0" y="8">
            z
          </text>
          <text x="9" y="-3">
            Z
          </text>
        </g>
      )}
    </svg>
  );
}
