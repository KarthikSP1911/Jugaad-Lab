import { ALIASES, KEYWORDS } from '@jugaad-hinglish/core';
import type { Locale } from '../../lib/i18n/locales';
import { STRINGS, type KeywordKind } from '../../lib/i18n/strings';
import { BUILTINS } from '../../lib/reference';
import { CodeBlock } from '../code';

const SHAPES = `rakho x = 1;                    // variable
pakka PI = 3.14;                // constant

agar (x > 0) { } warna { }
jabtak (x < 5) { x += 1; }
chalo (rakho i = 0; i < 3; i += 1) { }

kaam jodo(a, b) { wapas a + b; }

rakho soochi = [1, 2, 3];
rakho kosh = { "naam": "Asha" };
`;

function aliasesOf(word: string): string[] {
  return [...ALIASES].filter(([, main]) => main === word).map(([alias]) => alias);
}

export function Cheatsheet({ locale }: { locale: Locale }) {
  const { nav, cheatsheet, keywords, builtins } = STRINGS[locale];
  return (
    <article className="prose">
      <h1>{nav.cheatsheet}</h1>
      <p>{cheatsheet.intro}</p>

      <h2 id="shapes">{cheatsheet.shapes}</h2>
      <CodeBlock source={SHAPES} />

      <h2 id="keywords">{cheatsheet.keywords}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{cheatsheet.keyword}</th>
              <th>{cheatsheet.meaning}</th>
              <th>{cheatsheet.aliases}</th>
            </tr>
          </thead>
          <tbody>
            {[...KEYWORDS].map(([word, kind]) => (
              <tr key={word}>
                <td>
                  <code>{word}</code>
                </td>
                <td>{keywords[kind as KeywordKind]}</td>
                <td>
                  {aliasesOf(word).map((alias, i) => (
                    <span key={alias}>
                      {i > 0 && ', '}
                      <code>{alias}</code>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="builtins">{cheatsheet.builtins}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{cheatsheet.function}</th>
              <th>{cheatsheet.does}</th>
            </tr>
          </thead>
          <tbody>
            {BUILTINS.map(({ name }) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{builtins[name]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
