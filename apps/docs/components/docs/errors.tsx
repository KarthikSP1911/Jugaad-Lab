import Link from 'next/link';
import { errorList } from '../../lib/error-list';
import { EXAMPLES } from '../../lib/examples';
import { execute } from '../../lib/execute';
import type { Locale } from '../../lib/i18n/locales';
import { STRINGS } from '../../lib/i18n/strings';
import { encodeShare } from '../../lib/share';
import { CodeBlock, ShellBlock } from '../code';
import { ErrorTable } from '../error-table';

const SAMPLE = EXAMPLES.find(({ id }) => id === 'errors') ?? EXAMPLES[0];

export function Errors({ locale }: { locale: Locale }) {
  const { nav, errors, errorTitles } = STRINGS[locale];
  const { message } = execute(SAMPLE.code, () => {}, { lang: 'hi' });
  const entries = errorList().map((entry) => {
    const local = errorTitles?.[entry.code];
    return local === undefined ? entry : { ...entry, local: local.replaceAll('`', '') };
  });
  return (
    <article className="prose">
      <h1>{nav.errors}</h1>
      <p>{errors.intro}</p>
      <CodeBlock source={SAMPLE.code} />
      <ShellBlock title={errors.error} source={message} />
      <p>
        <Link href={`/playground${encodeShare(SAMPLE.code)}`} className="button">
          {errors.fix}
        </Link>
      </p>
      <h2 id="codes">{errors.all}</h2>
      <ErrorTable errors={entries} strings={errors.table} />
      <p>{errors.exitCodes}</p>
    </article>
  );
}
