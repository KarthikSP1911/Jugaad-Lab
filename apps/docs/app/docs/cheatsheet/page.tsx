import { hinglish } from '@jugaad-hinglish/core';
import type { Metadata } from 'next';
import { CodeBlock } from '../../../components/code';
import { BUILTINS, KEYWORD_MEANINGS } from '../../../lib/reference';

export const metadata: Metadata = { title: 'Cheatsheet' };

const SHAPES = `rakho x = 1;                    // variable
pakka PI = 3.14;                // constant

agar (x > 0) { } warna { }
jabtak (x < 5) { x += 1; }
chalo (rakho i = 0; i < 3; i += 1) { }

kaam jodo(a, b) { wapas a + b; }

rakho soochi = [1, 2, 3];
rakho kosh = { "naam": "Asha" };
`;

export default function Cheatsheet() {
  return (
    <article className="prose">
      <h1>Cheatsheet</h1>
      <p>Everything you need on one page.</p>

      <h2 id="shapes">Statements at a glance</h2>
      <CodeBlock source={SHAPES} />

      <h2 id="keywords">Keywords</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {[...hinglish].map(([word, kind]) => (
              <tr key={word}>
                <td>
                  <code>{word}</code>
                </td>
                <td>{KEYWORD_MEANINGS[kind]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="builtins">Built-in functions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Function</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            {BUILTINS.map(({ name, does }) => (
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
