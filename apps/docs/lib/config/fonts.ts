import { Bricolage_Grotesque, Inter, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' });
const sans = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });
const devanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-devanagari',
});

/** Class names that define the font variables used by the stylesheet. */
export const FONT_CLASSES = `${display.variable} ${sans.variable} ${mono.variable} ${devanagari.variable}`;
