import { Inter, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google';

// `next/font` reads these options at build time, so each must be written out in full.
const sans = Inter({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-inter' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-jetbrains',
});
const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '700'],
  variable: '--font-devanagari',
});

/** Class names that define the font variables used by the stylesheet. */
export const FONT_CLASSES = `${sans.variable} ${mono.variable} ${devanagari.variable}`;
