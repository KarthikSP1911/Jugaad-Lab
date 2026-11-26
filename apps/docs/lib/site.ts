export const SITE = {
  name: 'Jugaad Hinglish',
  tagline: 'A small programming language with Roman-script Hindi keywords.',
  repository: 'https://github.com/KarthikSP1911/Jugaad-Lab',
} as const;

export const NAV = [
  { href: '/docs', label: 'Docs' },
  { href: '/playground', label: 'Playground' },
] as const;

export const DOCS_NAV = [
  { href: '/docs', label: 'Getting started' },
  { href: '/docs/tour', label: 'Language tour' },
  { href: '/docs/reference', label: 'Reference' },
  { href: '/docs/errors', label: 'Error codes' },
] as const;
