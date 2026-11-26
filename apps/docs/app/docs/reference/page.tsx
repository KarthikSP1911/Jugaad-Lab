import type { Metadata } from 'next';
import { MarkdownPage } from '../../../components/markdown-page';

export const metadata: Metadata = { title: 'Reference' };

export default function Reference() {
  return (
    <MarkdownPage
      file="language-spec.md"
      notice={
        <div className="notice">
          The name, file extension, command and keyword spellings may still change.
        </div>
      }
    />
  );
}
