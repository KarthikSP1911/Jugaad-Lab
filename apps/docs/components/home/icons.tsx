/** Line icons for the feature cards, in the order of the cards. */
const PATHS = {
  words: 'M4 6h16M4 12h10M4 18h7M17 14l3 3-3 3',
  functions: 'M8 4C5 4 7 12 4 12c3 0 1 8 4 8m8-16c3 0 1 8 4 8-3 0-1 8-4 8M10 9l4 6m0-6-4 6',
  browser: 'M3 5h18v14H3zM3 9h18M6.5 7h.01M9.5 7h.01M10 12l5 2.5-5 2.5z',
  errors: 'M4 5h16v11H11l-5 4v-4H4zM12 8v3m0 2.5h.01',
  hindi: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zm0 13a3 3 0 0 1 3-3h11M9 8h6',
  source: 'M8 7l-5 5 5 5m8-10 5 5-5 5M14 5l-4 14',
} as const;

export type IconName = keyof typeof PATHS;

export const ICON_NAMES = Object.keys(PATHS) as IconName[];

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
