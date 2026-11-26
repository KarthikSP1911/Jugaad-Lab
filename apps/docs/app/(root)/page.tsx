import { DEFAULT_LOCALE, LOCALE_KEY, LOCALE_NAMES, LOCALES } from '../../lib/i18n/locales';

// A static export cannot redirect on the server, so the browser picks the locale.
const REDIRECT = `(function(){var l='${DEFAULT_LOCALE}';try{var s=localStorage.getItem('${LOCALE_KEY}');if(${JSON.stringify(LOCALES)}.indexOf(s)>-1)l=s}catch(e){}location.replace('/'+l+location.hash)})()`;

export default function Entry() {
  return (
    <main className="flex gap-3 p-8">
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      {/* Shown only when scripts are off. */}
      <noscript>
        {LOCALES.map((locale) => (
          <a key={locale} href={`/${locale}`} className="button mr-3" lang={locale}>
            {LOCALE_NAMES[locale]}
          </a>
        ))}
      </noscript>
    </main>
  );
}
