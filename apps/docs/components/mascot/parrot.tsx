import type { Mood } from '../../lib/mascot/mascot';

/** Mithu the parrot. The mood picks the CSS animation; see the stylesheet. */
export function Parrot({ mood, size }: { mood: Mood; size: number }) {
  return (
    <svg
      className={`parrot parrot-${mood}`}
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      aria-hidden="true"
    >
      <g className="parrot-bird">
        <path className="parrot-tail" d="M44 90 22 124l14-3 4 8 20-34z" />
        <ellipse className="parrot-body" cx="62" cy="75" rx="29" ry="35" />
        <ellipse className="parrot-belly" cx="69" cy="83" rx="17" ry="24" />
        <path className="parrot-wing" d="M45 62c-15 8-17 30-6 42 12-5 21-20 19-38z" />
        <g className="parrot-head">
          <g className="parrot-crest">
            <path d="M58 20C50 12 50 5 55 2c1 7 6 10 11 13z" />
            <path d="M66 17c-2-9 2-14 8-15-3 6 0 11 2 16z" />
          </g>
          <circle className="parrot-body" cx="66" cy="40" r="26" />
          <circle className="parrot-face" cx="73" cy="36" r="11" />
          <g className="parrot-eye">
            <circle className="parrot-pupil" cx="75" cy="36" r="5" />
            <circle className="parrot-face" cx="77" cy="34" r="1.6" />
          </g>
          <path className="parrot-jaw" d="M83 50c4 1 8 0 10-3-1 8-6 12-12 9z" />
          <path className="parrot-beak" d="M83 33c13-2 21 8 16 21-2-6-8-6-17-5z" />
        </g>
        <path className="parrot-feet" d="M54 107v7m16-7v7" />
      </g>
      <path className="parrot-perch" d="M28 116h76" />
      <circle className="parrot-node" cx="107" cy="116" r="4" />
    </svg>
  );
}
