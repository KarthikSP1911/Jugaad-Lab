import type { Metadata } from 'next';
import { Playground } from '../../../components/playground';
import { pageLocale, type LocaleProps } from '../../../lib/i18n/page';

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return { title: t.playground.title };
}

export default async function PlaygroundPage(props: LocaleProps) {
  const { t } = await pageLocale(props);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Playground>
        <h1 className="text-2xl font-bold tracking-tight text-brand">{t.playground.title}</h1>
        <p className="mt-1 text-sm text-muted">{t.playground.privacy}</p>
      </Playground>
    </div>
  );
}
