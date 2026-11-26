import Link from 'next/link';
import { CodeBlock } from '../../components/code';
import { HeroDemo } from '../../components/hero-demo';
import { Logo } from '../../components/logo';
import { Mascot } from '../../components/mascot';
import { Reveal } from '../../components/motion';
import { examples } from '../../lib/examples';
import { execute } from '../../lib/execute';
import { ERROR_LANG, localePath, type Locale } from '../../lib/i18n/locales';
import { pageLocale, type LocaleProps } from '../../lib/i18n/page';
import { GREETING, TIPS } from '../../lib/mascot';
import { encodeShare } from '../../lib/share';
import { STATUS } from '../../lib/status';

function sample(locale: Locale) {
  const list = examples(locale);
  return list.find(({ id }) => id === 'functions') ?? list[0];
}

function outputOf(code: string): string[] {
  let output = '';
  execute(code, (text) => (output += text));
  return output.trimEnd().split('\n');
}

export default async function Home(props: LocaleProps) {
  const { locale, t } = await pageLocale(props);
  const { home } = t;
  const { code } = sample(locale);
  const lang = ERROR_LANG[locale];
  const status = [
    { title: home.inVersion, items: STATUS[locale].works },
    { title: home.notIn, items: STATUS[locale].notYet },
  ];
  return (
    <>
      <section className="hero border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div className="min-w-0">
            <Reveal className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Logo size={96} />
              <Mascot auto mood="idle" line={GREETING[lang]} tips={TIPS.map((tip) => tip[lang])} />
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand sm:text-5xl">
                {home.headingStart}
                <span className="text-accent">{home.headingAccent}</span>
                {home.headingEnd}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-4 max-w-xl text-lg text-muted">{t.tagline}</p>
            </Reveal>
            <Reveal delay={0.24} className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${localePath(locale, '/playground')}${encodeShare(code)}`}
                className="button button-primary"
              >
                {home.tryIt}
              </Link>
              <Link href={localePath(locale, '/docs')} className="button">
                {home.readDocs}
              </Link>
            </Reveal>
          </div>
          <div className="min-w-0">
            <HeroDemo code={<CodeBlock source={code} />} output={outputOf(code)} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight">{home.startHere}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {home.steps.map(({ href, title, body }, index) => (
            <Reveal key={href} delay={index * 0.08} className="grid">
              <Link href={localePath(locale, href)} className="card card-link">
                <span className="step-number">{index + 1}</span>
                <h3 className="mt-3 font-semibold">{title} →</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
              </Link>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold tracking-tight">{home.smallOnPurpose}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {home.features.map(({ title, body }, index) => (
            <Reveal key={title} delay={(index % 3) * 0.08} className="grid">
              <article className="card">
                <h3 className="font-semibold text-brand">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-bold tracking-tight">{home.whereItStands}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {status.map(({ title, items }, index) => (
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
