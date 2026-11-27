import type { Metadata } from 'next';
import { MarkdownPage } from '../../../../components/content/markdown-page';
import { pageLocale, type LocaleProps } from '../../../../lib/i18n/page';

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return { title: t.docsNav.reference };
}

export default async function Reference(props: LocaleProps) {
  const { locale, t } = await pageLocale(props);
  return (
    <MarkdownPage
      file="language-spec.md"
      locale={locale}
      notice={<div className="notice">{t.reference.notice}</div>}
    />
  );
}
