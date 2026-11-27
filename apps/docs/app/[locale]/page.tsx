import Link from 'next/link';
import { CodeBlock } from '../../components/ui/code';
import { HeroDemo } from '../../components/content/hero-demo';
import { Mascot } from '../../components/mascot/mascot';
import { Reveal } from '../../components/ui/motion';
import { examples } from '../../lib/content/examples';
import { execute } from '../../lib/playground/execute';
import { ERROR_LANG, localePath, type Locale } from '../../lib/i18n/locales';
import { pageLocale, type LocaleProps } from '../../lib/i18n/page';
import { GREETING, TIPS } from '../../lib/mascot/mascot';
import { encodeShare } from '../../lib/playground/share';
import { STATUS } from '../../lib/content/status';

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
    { title: home.inVersion, items: STATUS[locale].works, mark: '✓' },
    { title: home.notIn, items: STATUS[locale].notYet, mark: '–' },
  ];
  return (
    <>
      <section className="hero">
        <div className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-6 lg:grid-cols-[5fr_6fr] lg:gap-10 lg:py-8">
          <div className="min-w-0">
            <Reveal>
              <h1 className="hero-title">
                {home.headingStart}
                <span className="text-accent">{home.headingAccent}</span>
                {home.headingEnd}
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-4 max-w-xl text-lg text-muted">{t.tagline}</p>
            </Reveal>
            <Reveal delay={0.16} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={`${localePath(locale, '/playground')}${encodeShare(code)}`}
                className="button button-primary button-large"
              >
                {home.tryIt}
              </Link>
              <Link href={localePath(locale, '/docs')} className="link font-semibold">
                {home.readDocs} →
              </Link>
            </Reveal>
            <Reveal delay={0.24} className="mt-6">
              <Mascot auto mood="idle" line={GREETING[lang]} tips={TIPS.map((tip) => tip[lang])} />
            </Reveal>
          </div>
          <div className="min-w-0">
            <HeroDemo code={<CodeBlock source={code} />} output={outputOf(code)} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <section className="home-section">
          <h2 className="section-title">{home.startHere}</h2>
          <ol className="path">
            {home.steps.map(({ href, title, body }, index) => (
              <li key={href}>
                <Link href={localePath(locale, href)} className="path-step">
                  <span className="step-number">{index + 1}</span>
                  <h3 className="mt-3 font-semibold">{title} →</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="home-section">
          <h2 className="section-title">{home.smallOnPurpose}</h2>
          <dl className="features">
            {home.features.map(({ title, body }) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="home-section">
          <h2 className="section-title">{home.whereItStands}</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {status.map(({ title, items, mark }) => (
              <div key={title}>
                <h3 className="border-b-2 border-line pb-2 font-semibold">{title}</h3>
                <ul className="text-sm text-muted">
                  {items.map((item) => (
                    <li key={item} className="flex gap-3 border-b border-line py-2.5">
                      <span aria-hidden="true" className="text-accent">
                        {mark}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
