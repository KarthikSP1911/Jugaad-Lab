import { highlight } from '../lib/highlight';
import { CopyButton } from './copy-button';

export function Highlighted({ source }: { source: string }) {
  return highlight(source).map((segment, index) => (
    <span key={index} className={`tok-${segment.kind}`}>
      {segment.text}
    </span>
  ));
}

export function CodeBlock({ source, title = 'Hinglish' }: { source: string; title?: string }) {
  const text = source.trimEnd();
  return (
    <figure className="code-card">
      <figcaption>
        {title}
        <CopyButton text={text} />
      </figcaption>
      <pre className="code-block" tabIndex={0}>
        <code>
          <Highlighted source={text} />
        </code>
      </pre>
    </figure>
  );
}

/** Commands, output or other text that is not a Hinglish program. */
export function ShellBlock({ source, title = 'Terminal' }: { source: string; title?: string }) {
  return (
    <figure className="code-card">
      <figcaption>
        {title}
        <CopyButton text={source} />
      </figcaption>
      <pre className="code-block" tabIndex={0}>
        <code>{source}</code>
      </pre>
    </figure>
  );
}
