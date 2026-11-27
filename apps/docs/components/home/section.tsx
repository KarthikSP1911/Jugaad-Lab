import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  subtitle: string;
  /** Sets the section on the tinted background. */
  tinted?: boolean;
  children: ReactNode;
}

export function Section({ id, title, subtitle, tinted = false, children }: Props) {
  return (
    <section
      className={tinted ? 'home-section home-section-tinted' : 'home-section'}
      aria-labelledby={id}
    >
      <div className="wrap">
        <header className="section-head">
          <h2 id={id}>{title}</h2>
          <p>{subtitle}</p>
        </header>
        {children}
      </div>
    </section>
  );
}
