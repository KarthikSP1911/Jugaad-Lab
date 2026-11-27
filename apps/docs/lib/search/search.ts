export interface SearchEntry {
  title: string;
  section: string;
  href: string;
  /** Extra words that should find this entry. */
  keywords?: string;
}

export const MAX_RESULTS = 20;

/** Entries containing every word of the query; matches in the title come first. */
export function search(entries: readonly SearchEntry[], query: string): SearchEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = entries.flatMap((entry) => {
    const title = entry.title.toLowerCase();
    const all = `${title} ${entry.section} ${entry.keywords ?? ''}`.toLowerCase();
    if (!words.every((word) => all.includes(word))) return [];
    return [{ entry, rank: words.every((word) => title.includes(word)) ? 0 : 1 }];
  });
  return matches
    .sort((a, b) => a.rank - b.rank)
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => entry);
}
