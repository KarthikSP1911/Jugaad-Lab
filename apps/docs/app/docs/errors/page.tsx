import type { Metadata } from 'next';
import Link from 'next/link';
import { CodeBlock, ShellBlock } from '../../../components/code';
import { ErrorTable } from '../../../components/error-table';
import { errorList } from '../../../lib/error-list';
import { EXAMPLES } from '../../../lib/examples';
import { execute } from '../../../lib/execute';
import { encodeShare } from '../../../lib/share';

export const metadata: Metadata = { title: 'Error codes' };

const SAMPLE = EXAMPLES.find(({ id }) => id === 'errors') ?? EXAMPLES[0];

export default function Errors() {
  const { message } = execute(SAMPLE.code, () => {}, { lang: 'hi' });
  return (
    <article className="prose">
      <h1>Error codes</h1>
      <p>
        Errors are written in Hinglish. Each one shows its code, the file, line and column, and
        points at the mistake. For this program:
      </p>
      <CodeBlock source={SAMPLE.code} />
      <ShellBlock title="Error" source={message} />
      <p>
        <Link href={`/playground${encodeShare(SAMPLE.code)}`} className="button">
          Fix it in the playground →
        </Link>
      </p>
      <h2 id="codes">All codes</h2>
      <ErrorTable errors={errorList()} />
      <p>Command line exit codes: 0 ok, 65 compile errors, 70 runtime error.</p>
    </article>
  );
}
