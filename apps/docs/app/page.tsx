import Link from 'next/link';
import { CodeBlock } from '../components/code';
import { HeroDemo } from '../components/hero-demo';
import { Logo } from '../components/logo';
import { Reveal } from '../components/motion';
import { EXAMPLES } from '../lib/examples';
import { execute } from '../lib/execute';
import { encodeShare } from '../lib/share';
import { SITE } from '../lib/site';
import { NOT_YET, WORKS } from '../lib/status';

const FEATURES = [
  {
    title: 'Familiar words',
    body: 'rakho, agar, jabtak and kaam: one Hinglish word per keyword, written in Roman script.',
  },
  {
    title: 'Familiar structure',
    body: 'Braces for blocks, parentheses around conditions and semicolons to end statements.',
  },
  {
    title: 'Catches mistakes early',
    body: 'Undefined names, reassigned constants and wrong argument counts stop the program before it runs.',
  },
  {
    title: 'Errors in Hinglish',
    body: 'Every error shows the line and column and explains itself in Hinglish, or in English if you prefer.',
  },
  {
    title: 'An editor that helps',
    body: 'The playground colours your code and suggests keywords, built-ins and your own names.',
  },
  {
    title: 'Runs in your browser',
    body: 'The playground runs the interpreter on your device. Your code is not sent to a server.',
  },
];

const STEPS = [
  { href: '/docs', title: 'Get started', body: 'Write your first program in a minute.' },
  { href: '/docs/tour', title: 'Take the tour', body: 'Learn each idea from a runnable example.' },
  { href: '/docs/cheatsheet', title: 'Keep the cheatsheet', body: 'Keywords and built-ins.' },
];

const STATUS = [
  { title: 'In version 0.1.0', items: WORKS },
  { title: 'Not in 0.1', items: NOT_YET },
];

const SAMPLE = EXAMPLES.find(({ id }) => id === 'functions') ?? EXAMPLES[0];

function sampleOutput(): string[] {
  let output = '';
  execute(SAMPLE.code, (text) => (output += text));
  return output.trimEnd().split('\n');
}

export default function Home() {
  return (
    <>
      <section className="hero border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <Reveal>
              <Logo size={96} />
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand sm:text-5xl">
                Code likho, <span className="text-accent">apni bhasha</span> mein.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 max-w-xl text-lg text-muted">{SITE.tagline}</p>
            </Reveal>
            <Reveal delay={0.24} className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/playground${encodeShare(SAMPLE.code)}`}
                className="button button-primary"
              >
                Try it in the playground
              </Link>
              <Link href="/docs" className="button">
                Read the docs
              </Link>
            </Reveal>
          </div>
          <div className="min-w-0">
            <HeroDemo code={<CodeBlock source={SAMPLE.code} />} output={sampleOutput()} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight">Start here</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ href, title, body }, index) => (
            <Reveal key={href} delay={index * 0.08} className="grid">
              <Link href={href} className="card card-link">
                <span className="step-number">{index + 1}</span>
                <h3 className="mt-3 font-semibold">{title} →</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold tracking-tight">Small on purpose</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, body }, index) => (
            <Reveal key={title} delay={(index % 3) * 0.08} className="grid">
              <article className="card">
                <h3 className="font-semibold text-brand">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold tracking-tight">Where it stands</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {STATUS.map(({ title, items }, index) => (
            <Reveal key={title} delay={index * 0.08} className="grid">
              <article className="card">
                <h3 className="font-semibold">{title}</h3>
                <ul className="mt-2 list-disc pl-5 text-sm leading-7 text-muted">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
