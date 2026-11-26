import type { Metadata } from 'next';
import { MarkdownPage } from '../../../components/markdown-page';

export const metadata: Metadata = { title: 'Error codes' };

export default function Errors() {
  return <MarkdownPage file="error-codes.md" />;
}
