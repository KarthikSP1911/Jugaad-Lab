import type { Dictionary } from '../../lib/i18n';
import { Icon, ICON_NAMES } from './icons';
import { Section } from './section';

export function Features({ t }: { t: Dictionary }) {
  const text = t.home.features;
  return (
    <Section id="features" title={text.title} subtitle={text.subtitle}>
      <ul className="feature-grid">
        {text.items.map(({ title, body }, index) => (
          <li key={title} className="home-card">
            <Icon name={ICON_NAMES[index] ?? 'words'} />
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
