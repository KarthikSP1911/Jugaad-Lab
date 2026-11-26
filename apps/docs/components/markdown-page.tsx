import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { headings, readDoc } from '../lib/markdown';
import { Toc } from './toc';

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
        <Toc headings={headings(source)} />
      </aside>
    </div>
  );
}
