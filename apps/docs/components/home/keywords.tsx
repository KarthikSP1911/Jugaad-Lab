import { hinglish } from '@jugaad-hinglish/core';
import Link from 'next/link';
import { KEYWORD_PAIRS } from '../../lib/content/home';
import { builtins, KEYWORD_MEANINGS } from '../../lib/content/reference';
import type { Dictionary } from '../../lib/i18n';
import { localePath, type Locale } from '../../lib/i18n/locales';
import { Section } from './section';

export function Keywords({ locale, t }: { locale: Locale; t: Dictionary }) {
  const text = t.home.keywords;
  const print = builtins(locale).find(({ name }) => name.startsWith('bolo('))?.does ?? '';
  const meaning = (word: string) => KEYWORD_MEANINGS[locale][hinglish.get(word) ?? ''] ?? print;
  return (
    <Section id="keywords" title={text.title} subtitle={text.subtitle} tinted>
      <table className="keyword-table">
        <thead>
          <tr>
            <th scope="col">Hinglish</th>
            <th scope="col">English</th>
            <th scope="col">{text.meaning}</th>
          </tr>
        </thead>
        <tbody>
          {KEYWORD_PAIRS.map(([word, english]) => (
            <tr key={word}>
              <th scope="row">
                <code className="tok-keyword">{word}</code>
              </th>
              <td>
                <span aria-hidden="true">→ </span>
                <code lang="en">{english}</code>
              </td>
              <td>{meaning(word)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="section-more">
        <Link className="link" href={localePath(locale, '/docs/cheatsheet')}>
          {text.all}
        </Link>
      </p>
    </Section>
  );
}
