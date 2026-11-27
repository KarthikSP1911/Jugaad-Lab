import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock, ShellBlock } from '../../../../components/ui/code';
import { ErrorTable } from '../../../../components/content/error-table';
import { errorList } from '../../../../lib/content/error-list';
import { examples } from '../../../../lib/content/examples';
import { execute } from '../../../../lib/playground/execute';
import { ERROR_LANG, localePath } from '../../../../lib/i18n/locales';
import { pageLocale, type LocaleProps } from '../../../../lib/i18n/page';
import { encodeShare } from '../../../../lib/playground/share';

export async function generateMetadata(props: LocaleProps): Promise<Metadata> {
  const { t } = await pageLocale(props);
  return { title: t.docsNav.errors };
}

export default async function Errors(props: LocaleProps) {
  const { locale, t } = await pageLocale(props);
  const list = examples(locale);
  const { code } = list.find(({ id }) => id === 'errors') ?? list[0];
  const { message } = execute(code, () => {}, { lang: ERROR_LANG[locale] });
  return (
    <article className="prose">
      <h1>{t.docsNav.errors}</h1>
      <p>{t.errors.intro}</p>
      <CodeBlock source={code} />
      <ShellBlock title={t.code.error} source={message} />
      <p>
        <Link href={`${localePath(locale, '/playground')}${encodeShare(code)}`} className="button">
          {t.errors.fix}
        </Link>
      </p>
      <h2 id="codes">{t.errors.all}</h2>
      <ErrorTable errors={errorList(locale)} />
      <p>{t.errors.exitCodes}</p>
    </article>
  );
}
