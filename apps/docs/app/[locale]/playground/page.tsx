import type { Metadata } from 'next';
import { Playground } from '../../../components/playground/playground';
import { pageLocale, type LocaleProps } from '../../../lib/i18n/page';

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return { title: t.playground.title };
}

export default async function PlaygroundPage(props: LocaleProps) {
  const { t } = await pageLocale(props);
  return (
    <div className="workbench-page">
      <Playground>
        <h1 className="toolbar-title">{t.playground.title}</h1>
      </Playground>
      <p className="mt-2 text-xs text-muted">{t.playground.privacy}</p>
    </div>
  );
}
