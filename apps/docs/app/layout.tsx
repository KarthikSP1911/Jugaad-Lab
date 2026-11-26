import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { Footer } from '../components/footer';
import { Header } from '../components/header';
import { MotionProvider } from '../components/motion';
import { SoundProvider } from '../components/sound';
import { SITE } from '../lib/site';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

export const metadata: Metadata = {
  title: { default: SITE.name, template: `%s · ${SITE.name}` },
  description: SITE.tagline,
};

// Applies a saved theme before the first paint.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Animated content starts hidden, so show it when scripts are off. */}
        <noscript>
          <style>{'[data-reveal]{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <SoundProvider>
            <Header />
            <main id="content" className="flex-1">
              {children}
            </main>
            <Footer />
          </SoundProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
