import type { Locale } from '../../lib/i18n/locales';
import { SPEC_FILE, STRINGS } from '../../lib/i18n/strings';
import { MarkdownPage } from '../markdown-page';

export function Reference({ locale }: { locale: Locale }) {
  return (
    <MarkdownPage
      file={SPEC_FILE[locale]}
      notice={<div className="notice">{STRINGS[locale].reference.notice}</div>}
    />
  );
}
