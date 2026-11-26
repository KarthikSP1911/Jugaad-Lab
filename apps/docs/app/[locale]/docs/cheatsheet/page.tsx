import { hinglish } from '@jugaad-hinglish/core';
import type { Metadata } from 'next';
import { CodeBlock } from '../../../../components/code';
import type { Dictionary } from '../../../../lib/i18n';
import { pageLocale, type LocaleProps } from '../../../../lib/i18n/page';
import { builtins, KEYWORD_MEANINGS } from '../../../../lib/reference';

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return { title: t.docsNav.cheatsheet };
}

function shapes({ variable, constant, sampleName }: Dictionary['cheatsheet']): string {
  return `rakho x = 1;                    // ${variable}
pakka PI = 3.14;                // ${constant}

agar (x > 0) { } warna { }
jabtak (x < 5) { x += 1; }
chalo (rakho i = 0; i < 3; i += 1) { }

kaam jodo(a, b) { wapas a + b; }

rakho soochi = [1, 2, 3];
rakho kosh = { "naam": "${sampleName}" };
`;
}

export default async function Cheatsheet(props: LocaleProps) {
  const { locale, t } = await pageLocale(props);
  const { cheatsheet: text } = t;
  return (
    <article className="prose">
      <h1>{t.docsNav.cheatsheet}</h1>
      <p>{text.intro}</p>

      <h2 id="shapes">{text.shapes}</h2>
      <CodeBlock source={shapes(text)} />

      <h2 id="keywords">{text.keywords}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{text.keyword}</th>
              <th>{text.meaning}</th>
            </tr>
          </thead>
          <tbody>
            {[...hinglish].map(([word, kind]) => (
              <tr key={word}>
                <td>
                  <code>{word}</code>
                </td>
                <td>{KEYWORD_MEANINGS[locale][kind]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="builtins">{text.builtins}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{text.function}</th>
              <th>{text.does}</th>
            </tr>
          </thead>
          <tbody>
            {builtins(locale).map(({ name, does }) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{does}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
