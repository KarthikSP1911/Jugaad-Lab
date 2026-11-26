import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { headings, readDoc } from '../lib/markdown';

export function MarkdownPage({ file, notice }: { file: string; notice?: ReactNode }) {
  const source = readDoc(file);
  return (
    <div className="flex gap-10">
      <article className="prose min-w-0 flex-1">
        {notice}
        <Markdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug]}
          components={{
            table: ({ children }) => (
              <div className="table-wrap">
                <table>{children}</table>
              </div>
            ),
          }}
        >
          {source}
        </Markdown>
      </article>
      <aside className="hidden w-48 shrink-0 xl:block">
        <nav aria-label="On this page" className="sticky top-24 text-sm">
          <p className="mb-2 font-semibold">On this page</p>
          {headings(source).map(({ id, text }) => (
            <a key={id} href={`#${id}`} className="block py-1 text-muted hover:text-ink">
              {text}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
