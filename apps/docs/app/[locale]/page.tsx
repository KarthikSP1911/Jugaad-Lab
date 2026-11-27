import Link from 'next/link';
import { Community } from '../../components/home/community';
import { Features } from '../../components/home/features';
import { HeroDemo } from '../../components/home/hero-demo';
import { Keywords } from '../../components/home/keywords';
import { LearningPaths } from '../../components/home/learning-paths';
import { QuickStart } from '../../components/home/quick-start';
import { localePath } from '../../lib/i18n/locales';
import { pageLocale, type LocaleProps } from '../../lib/i18n/page';

export default async function Home(props: LocaleProps) {
  const { locale, t } = await pageLocale(props);
  const { home } = t;
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title" className="hero-title">
              {home.headingStart}
              <span className="text-accent">{home.headingAccent}</span>
              {home.headingEnd}
            </h1>
            <p className="hero-subtitle">{home.subtitle}</p>
            <div className="hero-actions">
              <Link href={localePath(locale, '/playground')} className="button button-primary cta">
                {home.primary}
              </Link>
              <Link href={localePath(locale, '/docs')} className="button cta cta-secondary">
                {home.secondary}
              </Link>
            </div>
            <ul className="hero-trust">
              {home.trust.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <HeroDemo />
        </div>
      </section>
      <Keywords locale={locale} t={t} />
      <Features t={t} />
      <QuickStart locale={locale} t={t} />
      <LearningPaths locale={locale} t={t} />
      <Community locale={locale} t={t} />
    </div>
  );
}
