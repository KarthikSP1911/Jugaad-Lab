import { isValidElement, type ReactNode } from 'react';
import Markdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { DICTIONARIES } from '../../lib/i18n';
import type { Locale } from '../../lib/i18n/locales';
import { headings, readDoc } from '../../lib/content/markdown';
import { CodeBlock, ShellBlock } from '../ui/code';
import { Toc } from './toc';

interface Props {
  file: string;
  locale: Locale;
  notice?: ReactNode;
}

/** The text and language of a fenced block, given what sits inside its `pre`. */
function fence(children: ReactNode) {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(children)) return null;
  const { className = '', children: text } = children.props;
  if (typeof text !== 'string') return null;
  return { language: className.replace('language-', ''), source: text.trimEnd() };
}

export function MarkdownPage({ file, locale, notice }: Props) {
  const source = readDoc(file, locale);
  const t = DICTIONARIES[locale];
  const contents = headings(source);
  const inlineContents = (
    <details className="toc-inline">
      <summary>{t.docsNav.onThisPage}</summary>
      <ul>
        {contents.map(({ id, text }) => (
          <li key={id}>
            <a href={`#${id}`}>{text}</a>
          </li>
        ))}
      </ul>
    </details>
  );
  return (
    <div className="flex gap-10">
      <article className="prose min-w-0 flex-1">
        {notice}
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            // The contents list for narrow screens follows the page title.
            h1: ({ children }) => (
              <>
                <h1>{children}</h1>
                {inlineContents}
              </>
            ),
            table: ({ children }) => (
              <div className="table-wrap" tabIndex={0}>
                <table>{children}</table>
              </div>
            ),
            pre: ({ children }) => {
              const block = fence(children);
              if (!block) return <pre>{children}</pre>;
              if (block.language === 'hing') return <CodeBlock source={block.source} />;
              const title = block.language === 'ebnf' ? 'EBNF' : t.code.output;
              return <ShellBlock title={title} source={block.source} />;
            },
          }}
        >
          {source}
        </Markdown>
      </article>
      <aside className="hidden w-48 shrink-0 xl:block">
        <Toc headings={contents} />
      </aside>
    </div>
  );
}
