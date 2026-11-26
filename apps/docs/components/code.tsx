import { highlight } from '../lib/highlight';

export function Highlighted({ source }: { source: string }) {
  return highlight(source).map((segment, index) => (
    <span key={index} className={`tok-${segment.kind}`}>
      {segment.text}
    </span>
  ));
}

export function CodeBlock({ source }: { source: string }) {
  return (
    <pre className="code-block">
      <code>
        <Highlighted source={source.trimEnd()} />
      </code>
    </pre>
  );
}
